import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiRecommendFoodDto } from './dto/ai-recommend-food.dto';
import { AiGenerateImageDto } from './dto/ai-generate-image.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@campus-food/shared-types';

@ApiTags('AI Copilot')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask AI Copilot for sales analytics insights using Anthropic Function Calling' })
  async askAi(@Body() dto: AiChatDto) {
    return this.aiService.askAi(dto);
  }

  @Post('recommend-food')
  @ApiOperation({ summary: 'Mobile AI: Recommend food dishes ("กินอะไรดี?") based on user cravings, budget, and live campus vendor menus' })
  async recommendFood(@Body() dto: AiRecommendFoodDto) {
    return this.aiService.recommendFood(dto);
  }

  @Post('generate-menu-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Web AI: Generate appetizing AI food images for vendor menu creation' })
  async generateMenuImage(@Body() dto: AiGenerateImageDto) {
    return this.aiService.generateMenuImage(dto);
  }
}

