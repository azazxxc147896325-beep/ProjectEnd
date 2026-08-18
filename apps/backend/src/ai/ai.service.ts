import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';
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

  constructor(
    private configService: ConfigService,
    private analyticsService: AnalyticsService,
    private prisma: PrismaService,
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



  // Tool Definitions for Claude Function Calling
  private getTools(): Anthropic.Tool[] {
    return [
      {
        name: 'get_sales_summary',
        description: 'ดึงข้อมูลสรุปยอดขายรวม จำนวนออเดอร์ มูลค่าเฉลี่ยต่อออเดอร์ และสถิติแนวโน้มรายวันของร้านค้า',
        input_schema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['today', 'week', 'month'],
              description: 'ช่วงเวลาที่ต้องการดูสถิติ (today: วันนี้, week: 7 วันล่าสุด, month: 30 วันล่าสุด)',
            },
          },
          required: ['period'],
        },
      },
      {
        name: 'get_top_selling_items',
        description: 'ดึงรายการเมนูอาหารที่ขายดีที่สุด เรียงตามจำนวนจานที่ขายได้และรายได้รวม',
        input_schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'จำนวนอันดับเมนูที่ต้องการ (เช่น 3, 5 หรือ 10)',
            },
          },
        },
      },
      {
        name: 'get_peak_hours',
        description: 'ดึงช่วงเวลาที่ลูกค้าสั่งอาหารเยอะที่สุด (ชั่วโมงเร่งด่วน/Peak Hours) เพื่อใช้วางแผนสต็อกวัตถุดิบและกำลังคน',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
    ];
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
        tools: this.getTools(),
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
          let resultData: any = {};

          if (name === 'get_sales_summary') {
            const period = (input as any).period || 'today';
            resultData = await this.analyticsService.getSummary(vendorId, period);
          } else if (name === 'get_top_selling_items') {
            const limit = (input as any).limit || 5;
            resultData = await this.analyticsService.getPopularItems(vendorId, limit);
          } else if (name === 'get_peak_hours') {
            resultData = await this.analyticsService.getPeakHours(vendorId);
          }

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
          tools: this.getTools(),
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
        answer: 'ขณะนี้ยังไม่มีรายการอาหารที่เปิดขายในระบบครับ เมื่อร้านค้าเปิดและเพิ่มเมนูแล้ว น้องหยกจะช่วยแนะนำเมนูเด็ดๆ ให้ทันทีเลยค่ะ ✨',
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
    const aiPrompt = `คุณคือ "น้องหยก" AI กูรูอาหารประจำโรงอาหารมหาวิทยาลัย
นักศึกษาถามว่า: "${query}"
(งบประมาณ: ${budget ? budget + ' บาท' : 'ไม่ระบุ'}, อารมณ์: ${mood || 'ทั่วไป'})

นี่คือเมนูที่ตรงกับความต้องการที่สุดจากร้านค้าจริงในโรงอาหาร:
${recommendedDishes.map((d, i) => `${i + 1}. ${d.name} (฿${d.price}) จากร้าน "${d.vendorName}" - ${d.matchReason}`).join('\n')}

เขียนข้อความแนะนำอาหารสั้นๆ 2-3 บรรทัด สไตล์น่ารัก เป็นกันเอง น่าทาน ชวนหิว แล้วบอกว่าสามารถกดสั่งซื้อใส่ตะกร้าด้านล่างได้เลย`;

    // Try Google Gemini first if key available
    if (this.geminiApiKey) {
      try {
        const geminiRes = await this.callGemini(aiPrompt, 'คุณคือผู้ช่วยแนะนำอาหารในโรงอาหารมหาวิทยาลัย ตอบสั้นๆ น่ารัก เป็นกันเอง ภาษาไทย');
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
        answer = `🌶️ สายแซ่บต้องถูกใจสิ่งนี้! จัดเมนูรสเด็ดจัดจ้านมาให้เติมพลังช่วงนี้เลยค่ะ กดสั่งล่วงหน้าไว้ได้เลยไม่ต้องรอคิวนานจ้า`;
      } else if (q.includes('หวาน') || q.includes('น้ำ') || q.includes('ชานม')) {
        answer = `🧋 เมนูเครื่องดื่มและของหวานเย็นชื่นใจมาแล้วค่ะ ดื่มแล้วตื่นพร้อมลุยเรียนต่อแน่นอน! เลือกร้านที่ชอบด้านล่างได้เลยนะคะ ✨`;
      } else {
        answer = `✨ วันนี้น้องหยกขอแนะนำเมนูยอดนิยมเหล่านี้เลยค่ะ สดใหม่ ทำร้อนๆ พร้อมเสิร์ฟจากร้านในโรงอาหาร กด **"ใส่ตะกร้า"** แล้วสั่งล่วงหน้าได้เลยค่ะ! 🍽️`;
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
   * Web AI: Menu Image Generator
   * Generates appetizing AI food photos based on dish name and style for vendors.
   */
  async generateMenuImage(dto: AiGenerateImageDto): Promise<AiGenerateImageResponse> {
    const { dishName, category = 'อาหารจานเดียว', style = 'realistic_studio', customPrompt = '' } = dto;

    const styleDescriptors: Record<AiFoodImageStyle, string> = {
      realistic_studio: 'professional commercial food studio photography, 8k resolution, shot on 50mm f/1.8 lens, perfect lighting, crisp appetizing details, fresh garnish, food magazine hero shot',
      street_food: 'authentic sizzling street food photography, steamy hot and freshly cooked, vibrant market lights, mouth-watering rich texture, savory street dish',
      minimal_cafe: 'clean minimalist modern cafe food aesthetic, soft morning natural sunlight, ceramic plate, cozy warm ambiance, high-end bistro styling',
      overhead_flatlay: 'top-down overhead flatlay food photography, beautifully plated on textured dark stone table, fresh raw ingredients and herbs around, culinary art',
      cinematic_moody: 'cinematic moody food photography, dark luxury aesthetic, dramatic rim lighting, rich deep colors, gourmet Michelin star dish presentation',
    };

    const styleText = styleDescriptors[style] || styleDescriptors.realistic_studio;
    const basePrompt = `Delicious appetizing ${dishName}, ${category}, ${customPrompt ? customPrompt + ', ' : ''}${styleText}, food styling, ultra detailed, award winning food photography`;

    // Encode prompt for AI generation URL
    const cleanPrompt = encodeURIComponent(basePrompt.trim());
    const seed1 = Math.floor(Math.random() * 999999);
    const seed2 = Math.floor(Math.random() * 999999);
    const seed3 = Math.floor(Math.random() * 999999);

    // Fast, ultra-high-definition AI diffusion endpoint (Pollinations FLUX / Turbo Food Model)
    const primaryUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=600&seed=${seed1}&model=flux&nologo=true&enhance=true`;
    const var1 = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=600&seed=${seed2}&model=flux&nologo=true&enhance=true`;
    const var2 = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=600&seed=${seed3}&model=flux&nologo=true&enhance=true`;

    return {
      imageUrl: primaryUrl,
      promptUsed: basePrompt,
      variations: [primaryUrl, var1, var2],
    };
  }
}

