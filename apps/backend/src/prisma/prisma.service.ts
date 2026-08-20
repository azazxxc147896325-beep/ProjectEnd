import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Supabase PgBouncer / Supavisor connection pooling configuration
      // Uses DATABASE_URL with connection_limit and pool_timeout settings
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    // Retry connection ให้ถึง 3 ครั้งก่อนล้มเลิก
    let retries = 3;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Connected to PostgreSQL via Supabase PgBouncer (Transaction Mode)');
        return;
      } catch (error: any) {
        retries--;
        this.logger.warn(
          `⚠️  DB connection attempt failed (${error?.message?.split('\n')[0]}). Retries left: ${retries}`,
        );
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
    this.logger.error('❌ Could not connect to Database after 3 attempts. Queries will fail at runtime.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from Database');
  }
}
