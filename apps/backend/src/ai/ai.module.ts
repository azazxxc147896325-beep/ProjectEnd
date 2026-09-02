import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiToolsExecutor } from './tools/ai-tools.executor';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AnalyticsModule, PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiToolsExecutor],
  exports: [AiService],
})
export class AiModule {}

