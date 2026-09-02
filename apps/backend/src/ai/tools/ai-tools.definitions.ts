import Anthropic from '@anthropic-ai/sdk';
import { AnalyticsPeriod } from '@campus-food/shared-types';

export interface GetSalesSummaryInput {
  period?: AnalyticsPeriod;
}

export interface GetTopSellingItemsInput {
  limit?: number;
}

export interface GetPeakHoursInput {}

export type AiToolInput = GetSalesSummaryInput | GetTopSellingItemsInput | GetPeakHoursInput;

export const AI_TOOLS_DEFINITIONS: Anthropic.Tool[] = [
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
