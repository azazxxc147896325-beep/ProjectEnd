import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiToolsExecutor } from './tools/ai-tools.executor';
import { AI_TOOLS_DEFINITIONS } from './tools/ai-tools.definitions';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiRecommendFoodDto } from './dto/ai-recommend-food.dto';
import { AiGenerateImageDto } from './dto/ai-generate-image.dto';
import {
  AiChatResponse,
  AiToolCallLog,
  AiFoodRecommendationResponse,
  RecommendedDishItem,
  AiGenerateImageResponse,
  AiFoodImageStyle,
} from '@campus-food/shared-types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private anthropic: Anthropic | null = null;
  private geminiApiKey: string | null = null;
  private nanoBananaApiKey: string | null = null;

  constructor(
    private configService: ConfigService,
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
    private toolsExecutor: AiToolsExecutor,
  ) {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey && anthropicKey.trim() !== '' && !anthropicKey.includes('your-anthropic-api-key')) {
      if (anthropicKey.startsWith('sk-ant-')) {
        this.anthropic = new Anthropic({ apiKey: anthropicKey });
        this.logger.log('Anthropic Claude Client initialized successfully');
      }
    }

    const geminiKey = this.configService.get<string>('GEMINI_API_KEY') || this.configService.get<string>('AI_API_KEY');
    if (geminiKey && geminiKey.trim() !== '') {
      this.geminiApiKey = geminiKey.trim();
      this.logger.log('AI API Key (Gemini) configured successfully');
    }

    const nanoKey = this.configService.get<string>('NANOBANANA_API_KEY');
    if (nanoKey && nanoKey.trim() !== '') {
      this.nanoBananaApiKey = nanoKey.trim();
      this.logger.log('NanoBanana AI Image Generator API Key configured successfully');
    }
  }

  /**
   * Helper to call Google Gemini API for fast, smart Thai language generation
   */
  private async callGemini(prompt: string, systemPrompt?: string): Promise<string | null> {
    if (!this.geminiApiKey) return null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : null;
    } catch (err) {
      this.logger.warn(`Gemini API call warning: ${err}`);
      return null;
    }
  }



  async askAi(dto: AiChatDto): Promise<AiChatResponse> {
    const { vendorId, message, history = [] } = dto;

    // If Anthropic API Key is not configured, use dynamic intelligent assistant powered by live Analytics queries
    if (!this.anthropic) {
      return this.handleFallbackAnalysis(vendorId, message);
    }

    try {
      const systemPrompt = `คุณคือ "Campus Food Copilot" ผู้ช่วย AI อัจฉริยะประจำแดชบอร์ดแม่ค้าในมหาวิทยาลัย
กฎเหล็กที่สำคัญที่สุด:
1. ห้ามสร้าง คิด หรือสุ่มตัวเลขยอดขาย/สถิติใดๆ ขึ้นมาเองเด็ดขาด
2. คุณต้องเรียกใช้ Tools (Function Calling) เพื่อดึงตัวเลขและข้อมูลจริงจากระบบของร้านค้า ID: "${vendorId}" เสมอ
3. นำข้อมูลตัวเลขจริงที่ได้ มาวิเคราะห์ สรุป และให้คำแนะนำเชิงกลยุทธ์ที่เป็นรูปธรรมและปฏิบัติได้จริงแก่แม่ค้า
4. ใช้ภาษาไทยที่สุภาพ เป็นกันเอง มีความเข้าใจหัวอกคนค้าขายในมหาวิทยาลัย พร้อมเสนอไอเดียเพิ่มยอดขาย`;

      const formattedMessages: Anthropic.MessageParam[] = [
        ...history.map((h) => ({
          role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: h.content,
        })),
        { role: 'user', content: message },
      ];

      const toolLogs: AiToolCallLog[] = [];

      // First call to Claude
      let response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: formattedMessages,
        tools: AI_TOOLS_DEFINITIONS,
      });

      // Handle function calling / tool use loops
      while (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (c): c is Anthropic.ToolUseBlock => c.type === 'tool_use',
        );

        if (toolUseBlocks.length === 0) break;

        const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          const { id, name, input } = block;
          const resultData = await this.toolsExecutor.executeTool(
            name,
            input as Record<string, any>,
            vendorId,
          );

          toolLogs.push({
            toolName: name,
            args: input as Record<string, any>,
            result: resultData,
          });

          toolResultContents.push({
            type: 'tool_result',
            tool_use_id: id,
            content: JSON.stringify(resultData),
          });
        }

        // Send tool results back to Claude for final synthesized response
        response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            ...formattedMessages,
            { role: 'assistant', content: response.content },
            { role: 'user', content: toolResultContents },
          ],
          tools: AI_TOOLS_DEFINITIONS,
        });
      }

      const textBlock = response.content.find((c) => c.type === 'text');
      const answer = textBlock && 'text' in textBlock ? textBlock.text : 'วิเคราะห์ข้อมูลเสร็จสิ้น';

      return {
        answer,
        toolCalls: toolLogs,
        suggestedActions: [
          'ดูเมนูขายดีประจำสัปดาห์',
          'ยอดขายวันนี้เทียบกับเมื่อวาน',
          'ช่วงเวลาที่ควรเตรียมวัตถุดิบเพิ่ม',
        ],
      };
    } catch (error: any) {
      this.logger.error(`Error communicating with Anthropic API: ${error?.message || error}`);
      return this.handleFallbackAnalysis(vendorId, message);
    }
  }

  /**
   * Fallback engine when Anthropic API Key is not yet configured or offline.
   * Directly queries the database through AnalyticsService to provide 100% accurate real numbers.
   */
  private async handleFallbackAnalysis(vendorId: string, query: string): Promise<AiChatResponse> {
    const summary = await this.analyticsService.getSummary(vendorId, 'today');
    const weekSummary = await this.analyticsService.getSummary(vendorId, 'week');
    const peakHours = await this.analyticsService.getPeakHours(vendorId);

    const activePeak = peakHours.filter((p) => p.orderCount > 0).sort((a, b) => b.orderCount - a.orderCount)[0];
    const topItem = weekSummary.popularItems[0];

    const lower = query.toLowerCase();
    let answer = '';

    if (lower.includes('ขายดี') || lower.includes('เมนู') || lower.includes('แนะนำ')) {
      if (weekSummary.popularItems.length > 0) {
        answer = `📊 **รายงานเมนูยอดนิยม (ข้อมูลจริงจากระบบ 7 วันล่าสุด):**\n\n`;
        weekSummary.popularItems.slice(0, 3).forEach((item, idx) => {
          answer += `${idx + 1}. **${item.name}** (หมวด ${item.category}) — ขายได้ **${item.totalQuantity} จาน** (ยอดขาย ฿${item.totalRevenue.toLocaleString()})\n`;
        });
        answer += `\n💡 **คำแนะนำ AI:** เมนู "${topItem?.name || ''}" ได้รับความนิยมสูงสุด ควรสต็อกวัตถุดิบหลักไว้ล่วงหน้า และสามารถทำโปรโมชันจับคู่กับเครื่องดื่มเพื่อเพิ่มยอดต่อบิลได้ครับ!`;
      } else {
        answer = `ยังไม่พบประวัติการสั่งซื้อในช่วงนี้ครับ เมื่อเริ่มมีออเดอร์เข้ามา AI จะวิเคราะห์เมนูขายดีให้ทันทีครับ`;
      }
    } else if (lower.includes('ช่วงเวลา') || lower.includes('คนเยอะ') || lower.includes('เวลา') || lower.includes('กี่โมง')) {
      if (activePeak) {
        answer = `⏰ **ช่วงเวลาที่ลูกค้าสั่งเยอะที่สุด (Peak Hours):**\n- ช่วงเวลาเร่งด่วน: **${activePeak.hour}:00 - ${activePeak.hour + 1}:00 น.** (จำนวน ${activePeak.orderCount} ออเดอร์)\n\n💡 **คำแนะนำ AI:** แนะนำให้เตรียมวัตถุดิบและจัดคิวก่อนเวลา ${activePeak.hour - 1}:30 น. เพื่อให้ทำอาหารได้ทันท่วงทีและลดเวลารอของนักศึกษาครับ`;
      } else {
        answer = `ช่วงเวลาสั่งอาหารของนักศึกษาจะคึกคักเป็นพิเศษช่วง 11:30 - 13:00 น. (มื้อเที่ยง) และ 17:30 - 19:00 น. (มื้อเย็น) ครับ`;
      }
    } else {
      answer = `📈 **สรุปยอดขายร้านของคุณวันนี้:**\n- ยอดขายรวม: **฿${summary.totalRevenue.toLocaleString()}**\n- จำนวนออเดอร์: **${summary.totalOrders} รายการ** (เฉลี่ย ฿${summary.averageOrderValue}/บิล)\n- ออเดอร์สำเร็จแล้ว: **${summary.completedOrders} รายการ**\n\n💡 **สรุป 7 วันล่าสุด:** ทำยอดขายรวมไปแล้ว **฿${weekSummary.totalRevenue.toLocaleString()}** จาก ${weekSummary.totalOrders} ออเดอร์\n(หมายเหตุ: ระบบเชื่อมต่อข้อมูลจริงจากฐานข้อมูลเรียบร้อย หากใส่ ANTHROPIC_API_KEY จะสามารถสนทนาและขอคำปรึกษาได้ละเอียดลึกยิ่งขึ้นครับ)`;
    }

    return {
      answer,
      toolCalls: [
        {
          toolName: 'get_sales_summary',
          args: { period: 'today', vendorId },
          result: { totalRevenue: summary.totalRevenue, totalOrders: summary.totalOrders },
        },
      ],
      suggestedActions: [
        'เมนูไหนขายดีที่สุดในรอบ 7 วัน?',
        'ช่วงเวลากี่โมงที่ลูกค้าสั่งอาหารเยอะที่สุด?',
        'สรุปยอดขายวันนี้',
      ],
    };
  }

  /**
   * Mobile AI: "กินอะไรดี?" (Food Concierge & Recommender)
   * Recommends actual available food items from active campus vendors based on user prompt, budget, and cravings.
   */
  async recommendFood(dto: AiRecommendFoodDto): Promise<AiFoodRecommendationResponse> {
    const { query, budget, category, mood, history = [] } = dto;

    // Fetch active menu items from Prisma
    let menuItems = await this.prisma.menuItem.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            isOpen: true,
          },
        },
      },
      orderBy: [{ isDailySpecial: 'desc' }, { price: 'asc' }],
      take: 50,
    });

    // If database is completely empty
    if (menuItems.length === 0) {
      return {
        answer: 'ขณะนี้ยังไม่มีรายการอาหารที่เปิดขายในระบบค่ะ เมื่อร้านค้าเปิดและเพิ่มเมนูแล้ว น้องหยกจะช่วยแนะนำเมนูเด็ดๆ ให้ทันทีเลยนะคะ ✨',
        recommendedDishes: [],
        suggestedPrompts: [
          '🔥 เมนูยอดนิยมงบไม่เกิน 60 บาท',
          '🍜 อยากกินก๋วยเตี๋ยวร้อนๆ ซดคล่องคอ',
          '🌶️ มีอะไรแซ่บๆ แนะนำบ้าง?',
          '🧋 ขอเครื่องดื่มหรือของหวานแก้ง่วง',
          '🎲 สุ่มเมนูเด็ดวันนี้ให้หน่อย',
        ],
      };
    }


    // Filter by budget if specified
    let candidates = [...menuItems];
    if (budget && budget > 0) {
      const budgetMatched = candidates.filter((item) => Number(item.price) <= budget);
      if (budgetMatched.length > 0) {
        candidates = budgetMatched;
      }
    }

    // If category specified
    if (category && category !== 'all') {
      const catMatched = candidates.filter((item) => item.category.toLowerCase() === category.toLowerCase());
      if (catMatched.length > 0) {
        candidates = catMatched;
      }
    }

    const q = query.toLowerCase();

    // Intelligent score-based ranking
    const scoredItems = candidates.map((item) => {
      let score = 0;
      let reason = 'เมนูยอดนิยม';

      if (item.isDailySpecial) {
        score += 3;
        reason = '⭐ เมนูแนะนำพิเศษประจำวัน';
      }

      // Keyword matching
      if (q.includes('เส้น') || q.includes('เตี๋ยว') || q.includes('ก๋วยเตี๋ยว') || q.includes('น้ำซุป') || q.includes('ซด')) {
        if (item.category.includes('ก๋วยเตี๋ยว') || item.name.includes('เตี๋ยว') || item.name.includes('น้ำ')) {
          score += 6;
          reason = '🍜 ร้อนๆ ซดคล่องคอโดนใจ';
        }
      }

      if (q.includes('กะเพรา') || q.includes('ข้าว') || q.includes('จานเดียว') || q.includes('อิ่ม') || q.includes('หนัก')) {
        if (item.category.includes('อาหารจานเดียว') || item.name.includes('ข้าว') || item.name.includes('กะเพรา')) {
          score += 5;
          reason = '🍛 อิ่มจุใจ ให้พลังงานเต็มที่';
        }
      }

      if (q.includes('แซ่บ') || q.includes('เผ็ด') || q.includes('ต้มยำ') || q.includes('จัดจ้าน')) {
        if (item.name.includes('ต้มยำ') || item.name.includes('กะเพรา') || item.name.includes('พริก') || item.description?.includes('จัดจ้าน') || item.description?.includes('เผ็ด')) {
          score += 6;
          reason = '🌶️ รสแซ่บจัดจ้านถึงใจ';
        }
      }

      if (q.includes('หวาน') || q.includes('น้ำ') || q.includes('ชานม') || q.includes('กาแฟ') || q.includes('สดชื่น') || q.includes('แก้ง่วง')) {
        if (item.category.includes('เครื่องดื่ม') || item.category.includes('ของหวาน') || item.name.includes('ชา') || item.name.includes('กาแฟ')) {
          score += 6;
          reason = '🧋 หวานฉ่ำ สดชื่นเติมพลังช่วงบ่าย';
        }
      }

      if (q.includes('คลีน') || q.includes('สุขภาพ') || q.includes('ไดเอท') || q.includes('สลัด') || q.includes('ไข่ต้ม')) {
        if (item.description?.includes('สุขภาพ') || item.name.includes('อกไก่') || item.name.includes('ไข่ต้ม') || item.category.includes('เพื่อสุขภาพ')) {
          score += 6;
          reason = '🥗 ดีต่อสุขภาพ แคลอรีพอเหมาะ';
        }
      }

      if (q.includes('งบ') || q.includes('ประหยัด') || q.includes('ถูก')) {
        if (Number(item.price) <= 50) {
          score += 4;
          reason = `💰 ราคาสบายกระเป๋าเพียง ฿${item.price}`;
        }
      }

      if (q.includes('สุ่ม') || q.includes('อะไรก็ได้') || q.includes('ตามใจ')) {
        score += Math.random() * 5;
        reason = '🎲 สุ่มเมนูเด็ดมาให้ลิ้มลอง!';
      }

      return { item, score, reason };
    });

    // Sort by highest score, fallback to random if tied
    scoredItems.sort((a, b) => b.score - a.score || Math.random() - 0.5);

    const selected = scoredItems.slice(0, 4);

    const recommendedDishes: RecommendedDishItem[] = selected.map(({ item, reason }) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      description: item.description,
      imageUrl: item.imageUrl,
      vendorId: item.vendorId,
      vendorName: item.vendor?.name || 'ร้านค้าในโรงอาหาร',
      category: item.category,
      matchReason: reason,
    }));

    // Natural Thai AI response text
    let answer = '';
    const aiPrompt = `คุณคือ "น้องหยก" AI สาวน้อยผู้ช่วยแนะนำอาหารประจำโรงอาหารมหาวิทยาลัย พูดจาน่ารัก สดใส เป็นกันเอง ใช้คำลงท้าย "ค่ะ/นะคะ" และแทนตัวเองว่า "น้องหยก" หรือ "หนู"
นักศึกษาถามว่า: "${query}"
(งบประมาณ: ${budget ? budget + ' บาท' : 'ไม่ระบุ'}, อารมณ์: ${mood || 'ทั่วไป'})

นี่คือเมนูที่ตรงกับความต้องการที่สุดจากร้านค้าจริงในโรงอาหาร:
${recommendedDishes.map((d, i) => `${i + 1}. ${d.name} (฿${d.price}) จากร้าน "${d.vendorName}" - ${d.matchReason}`).join('\n')}

เขียนข้อความแนะนำอาหารสั้นๆ 2-3 บรรทัด สไตล์สาวน้อยน่ารัก สดใส ชวนหิว ใช้สรรพนามเพศหญิง (ค่ะ, นะคะ, น้องหยก/หนู) แล้วบอกว่าสามารถกดเลือกดูหรือกดสั่งซื้อใส่ตะกร้าด้านล่างได้เลยนะคะ`;

    // Try Google Gemini first if key available
    if (this.geminiApiKey) {
      try {
        const geminiRes = await this.callGemini(aiPrompt, 'คุณคือน้องหยก AI สาวน้อยผู้ช่วยแนะนำอาหารในโรงอาหารมหาวิทยาลัย พูดจาน่ารัก สดใส สุภาพ ใช้คำลงท้าย "ค่ะ/นะคะ" ภาษาไทย');
        if (geminiRes) {
          answer = geminiRes;
        }
      } catch (err) {
        this.logger.warn(`Gemini recommendFood warning: ${err}`);
      }
    }

    // Try Anthropic Claude if available and answer not yet set
    if (!answer && this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          messages: [{ role: 'user', content: aiPrompt }],
        });

        const textBlock = response.content.find((c) => c.type === 'text');
        if (textBlock && 'text' in textBlock) {
          answer = textBlock.text;
        }
      } catch (err) {
        this.logger.warn(`Anthropic fallback in recommendFood: ${err}`);
      }
    }


    if (!answer) {
      if (q.includes('สุ่ม')) {
        answer = `🎲 น้องหยกสุ่มเมนูเด็ดโดนใจมาให้แล้วค่ะ! วันนี้ลองทาน **"${recommendedDishes[0]?.name}"** ดูไหมคะ หรือเลือกจากเมนูแนะนำด้านล่างแล้วกดใส่ตะกร้าได้เลยน้า ✨`;
      } else if (q.includes('งบ') || (budget && budget > 0)) {
        answer = `💰 สบายกระเป๋าแน่นอนค่ะ! น้องหยกคัดเมนูราคาสุดคุ้ม${budget ? ` ในงบไม่เกิน ${budget} บาท` : ''} มาให้เรียบร้อยแล้ว อร่อย อิ่ม คุ้มราคาแน่นอนค่ะ 😋`;
      } else if (q.includes('เผ็ด') || q.includes('แซ่บ') || q.includes('ต้มยำ')) {
        answer = `🌶️ สายแซ่บต้องถูกใจสิ่งนี้แน่นอนค่ะ! จัดเมนูรสเด็ดจัดจ้านมาให้เติมพลังช่วงนี้เลยน้า กดสั่งล่วงหน้าไว้ได้เลยไม่ต้องรอคิวนานค่ะ ✨`;
      } else if (q.includes('หวาน') || q.includes('น้ำ') || q.includes('ชานม')) {
        answer = `🧋 เมนูเครื่องดื่มและของหวานเย็นชื่นใจมาแล้วค่ะ ดื่มแล้วตื่นพร้อมลุยเรียนต่อแน่นอน! เลือกร้านที่ชอบด้านล่างได้เลยนะคะ ✨`;
      } else {
        answer = `✨ วันนี้น้องหยกขอแนะนำเมนูยอดนิยมเหล่านี้เลยค่ะ สดใหม่ ทำร้อนๆ พร้อมเสิร์ฟจากร้านในโรงอาหาร กด **"ใส่ตะกร้า"** แล้วสั่งล่วงหน้าได้เลยนะคะ! 🍽️`;
      }
    }


    const suggestedPrompts = [
      '🔥 เมนูยอดนิยมงบไม่เกิน 60 บาท',
      '🍜 อยากกินก๋วยเตี๋ยวร้อนๆ ซดคล่องคอ',
      '🌶️ มีอะไรแซ่บๆ แนะนำบ้าง?',
      '🧋 ขอเครื่องดื่มหรือของหวานแก้ง่วง',
      '🎲 สุ่มเมนูเด็ดวันนี้ให้หน่อย',
    ];

    return {
      answer,
      recommendedDishes,
      suggestedPrompts,
    };
  }

  /**
   * Translates Thai culinary terms to vivid English food photography keywords
   */
  private translateThaiFoodToEnglish(dishName: string, category: string, customPrompt: string): string {
    const raw = `${dishName} ${customPrompt}`.toLowerCase();
    const parts: string[] = [];

    if (raw.includes('กะเพรา') || raw.includes('กระเพรา')) parts.push('Thai holy basil stir-fry');
    else if (raw.includes('ผัดไทย') || raw.includes('ผัดไท')) parts.push('authentic Pad Thai noodles with lime and crushed peanuts');
    else if (raw.includes('ข้าวผัด')) parts.push('wok-fried Thai jasmine fried rice');
    else if (raw.includes('ข้าวมันไก่')) parts.push('Hainanese poached and crispy chicken rice with ginger dipping sauce');
    else if (raw.includes('ไก่ทอด')) parts.push('crispy golden Thai fried chicken cutlet over rice');
    else if (raw.includes('หมูกรอบ')) parts.push('crispy roasted pork belly with crispy golden crackling skin');
    else if (raw.includes('ต้มยำ')) parts.push('flavorful Tom Yum spicy soup with aromatic kaffir lime and chili paste');
    else if (raw.includes('ส้มตำ')) parts.push('spicy Thai green papaya salad with roasted peanuts');
    else if (raw.includes('เตี๋ยวเรือ') || raw.includes('ก๋วยเตี๋ยวเรือ')) parts.push('rich savory Thai boat noodle soup with tender braised meat');
    else if (raw.includes('เตี๋ยว') || raw.includes('ก๋วยเตี๋ยว')) parts.push('steaming Thai noodle soup bowl');
    else if (raw.includes('สเต็ก') || raw.includes('steak')) parts.push('sizzling tender grilled steak with crispy fries and pepper sauce');
    else if (raw.includes('เบอร์เกอร์') || raw.includes('burger')) parts.push('gourmet juicy cheese burger with melted cheddar on toasted brioche');
    else if (raw.includes('สลัด') || raw.includes('salad')) parts.push('fresh colorful organic salad bowl with sesame dressing');
    else if (raw.includes('ชานม') || raw.includes('ชาไทย')) parts.push('refreshing Thai iced milk tea with black tapioca pearls');
    else if (raw.includes('กาแฟ') || raw.includes('coffee')) parts.push('iced specialty espresso latte with creamy foam');
    else if (raw.includes('ไข่ข้น')) parts.push('creamy silky soft-scrambled egg bowl over rice');
    else if (raw.includes('แกง')) parts.push('fragrant rich Thai coconut curry');
    else parts.push('authentic appetizing Thai cuisine');

    if (raw.includes('ไข่ดาว')) parts.push('with crispy fried egg and runny golden yolk');
    if (raw.includes('กุ้ง')) parts.push('and fresh jumbo prawns');
    if (raw.includes('หมู')) parts.push('and savory seasoned pork');
    if (raw.includes('เนื้อ')) parts.push('and premium sliced beef');
    if (raw.includes('ไก่') && !parts.some((p) => p.includes('chicken'))) parts.push('and tender chicken');
    if (raw.includes('ทะเล') || raw.includes('ซีฟู้ด')) parts.push('and mixed fresh seafood');

    return parts.join(' ');
  }

  /**
   * Call NanoBanana AI API to generate high quality realistic food photography
   * Reference: https://docs.nanobananaapi.ai/nanobanana-api/generate-or-edit-image
   */
  /**
   * Call NanoBanana AI API to generate fast 720p food photography
   * Reference: https://docs.nanobananaapi.ai/nanobanana-api/generate-or-edit-image
   */
  private async generateWithNanoBanana(
    prompt: string,
    numImages = 1,
    imageSize = '4:3',
  ): Promise<string | null> {
    const apiKey = this.nanoBananaApiKey || 'f714661c24e133fce3b01f855eb3e10d';
    if (!apiKey) return null;

    try {
      this.logger.log(`[NanoBanana AI Fast 720p] Submitting task: "${prompt.slice(0, 60)}..."`);
      const createRes = await fetch('https://api.nanobananaapi.ai/api/v1/nanobanana/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          numImages,
          type: 'TEXTTOIAMGE',
          image_size: imageSize,
          callBackUrl: 'https://api.nanobananaapi.ai/callback',
        }),
      });

      if (!createRes.ok) {
        this.logger.warn(`[NanoBanana AI] Create task failed with HTTP ${createRes.status}`);
        return null;
      }

      const createData = await createRes.json();
      const taskId = createData?.data?.taskId;
      if (!taskId) {
        this.logger.warn(`[NanoBanana AI] No taskId returned: ${JSON.stringify(createData)}`);
        return null;
      }

      this.logger.log(`[NanoBanana AI] Task created (${taskId}). Polling result every 1s...`);

      // Fast polling: wait 1.5s first, then check every 1s up to 12 attempts
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const maxAttempts = 12;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const pollRes = await fetch(
          `https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=${encodeURIComponent(taskId)}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );

        if (pollRes.ok) {
          const pollData = await pollRes.json();
          const successFlag = pollData?.data?.successFlag;

          if (successFlag === 1) {
            const imgUrl = pollData?.data?.response?.resultImageUrl || pollData?.data?.response?.originImageUrl;
            if (imgUrl) {
              this.logger.log(`[NanoBanana AI] Fast 720p image ready in attempt #${attempt}: ${imgUrl}`);
              return imgUrl;
            }
          } else if (successFlag === 2 || successFlag === 3) {
            this.logger.warn(`[NanoBanana AI] Task failed with flag: ${successFlag}`);
            return null;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      this.logger.warn(`[NanoBanana AI] Polling timed out for task ${taskId}`);
      return null;
    } catch (err: any) {
      this.logger.warn(`[NanoBanana AI] Error during image generation: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Web AI: Menu Image Generator
   * Generates fast, appetizing 720p AI food photos based on dish name and style for vendors using NanoBanana AI.
   */
  async generateMenuImage(dto: AiGenerateImageDto): Promise<AiGenerateImageResponse> {
    const { dishName, category = 'อาหารจานเดียว', style = 'realistic_studio', customPrompt = '' } = dto;

    const styleDescriptors: Record<AiFoodImageStyle, string> = {
      realistic_studio: 'delicious appetizing 720p commercial food photography, clean studio lighting, crisp vibrant details, fresh garnish, cafe menu shot',
      street_food: 'authentic sizzling street food photography, steamy hot and freshly cooked, vibrant market lights, mouth-watering texture, 720p HD',
      minimal_cafe: 'clean minimalist modern cafe food aesthetic, soft morning natural sunlight, ceramic plate, cozy warm ambiance, 720p HD',
      overhead_flatlay: 'top-down overhead flatlay food photography, beautifully plated on textured table, fresh herbs, 720p HD',
      cinematic_moody: 'cinematic moody food photography, warm rim lighting, rich deep colors, gourmet dish presentation, 720p HD',
    };

    const styleText = styleDescriptors[style] || styleDescriptors.realistic_studio;

    // Fast Translation: Use built-in dictionary first for instant response (0ms), fallback to Gemini if needed
    let englishDishDescription = this.translateThaiFoodToEnglish(dishName, category, customPrompt);
    
    // Quick refinement with Gemini if custom prompt has unknown words
    if (customPrompt && customPrompt.length > 5) {
      try {
        const translationPrompt = `Translate this Thai food dish into English (max 10 words): "${dishName}" with "${customPrompt}"`;
        const aiTranslation = await Promise.race([
          this.callGemini(translationPrompt),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)), // Max 1s timeout
        ]);
        if (aiTranslation && aiTranslation.trim().length > 3) {
          englishDishDescription = aiTranslation.replace(/["\n\r]/g, '').trim();
        }
      } catch {
        // Keep dictionary result
      }
    }

    // Generate photography prompts optimized for fast 720p rendering
    const prompt1 = `Appetizing ${englishDishDescription}, ${styleText}`;
    const prompt2 = `Mouth-watering fresh ${englishDishDescription}, steaming hot, beautifully plated on ceramic dish, vibrant colors, 720p HD food photography`;
    const prompt3 = `Top-down overhead flatlay of ${englishDishDescription}, garnished with fresh herbs, gourmet cafe style, 720p food photo`;

    const seed2 = Math.floor(Math.random() * 899999) + 100000;
    const seed3 = Math.floor(Math.random() * 899999) + 100000;

    // Fast 720p backup/variation URLs (640x480 / 800x600 standard definition)
    const fallbackUrl1 = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt1.trim())}?width=720&height=540&seed=101010&model=flux&nologo=true`;
    const fallbackUrl2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt2.trim())}?width=720&height=540&seed=${seed2}&model=flux&nologo=true`;
    const fallbackUrl3 = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt3.trim())}?width=720&height=540&seed=${seed3}&model=flux&nologo=true`;

    // Try generating with NanoBanana AI (fast 4:3 720p)
    let primaryImageUrl: string | null = null;
    try {
      primaryImageUrl = await this.generateWithNanoBanana(prompt1, 1, '4:3');
    } catch (err) {
      this.logger.warn(`NanoBanana generation call error: ${err}`);
    }

    const finalMainUrl = primaryImageUrl || fallbackUrl1;

    return {
      imageUrl: finalMainUrl,
      promptUsed: prompt1,
      variations: [finalMainUrl, fallbackUrl2, fallbackUrl3],
    };
  }
}

