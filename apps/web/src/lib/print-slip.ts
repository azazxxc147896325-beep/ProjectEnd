/**
 * Thermal Printer Slip Utility for Campus Food
 * Optimized for Sunmi V2 (58mm) & Standard 80mm POS receipt printers as well as desktop printing.
 */

import { Order, OrderType, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';

export interface PrintSlipOptions {
  vendorName?: string;
  paperWidth?: '58mm' | '80mm';
  isWalkIn?: boolean;
}

export function printQueueSlip(order: Order, vendorNameOrOptions?: string | PrintSlipOptions) {
  const options: PrintSlipOptions =
    typeof vendorNameOrOptions === 'string'
      ? { vendorName: vendorNameOrOptions }
      : vendorNameOrOptions || {};

  const storeName = options.vendorName || order.vendor?.name || 'Campus Food';
  const orderTypeStr =
    order.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน (DINE-IN)' : '🛍️ สั่งกลับบ้าน (TAKEAWAY)';
  
  const dateStr = new Date(order.createdAt).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPaid = order.paymentStatus === PaymentStatus.PAID;
  const isPromptPay = order.paymentMethod === PaymentMethod.PROMPTPAY;

  const paymentStr = isPaid
    ? isPromptPay
      ? '✅ พร้อมเพย์ (ชำระเงินแล้ว)'
      : '✅ เงินสด (ชำระเงินแล้ว)'
    : isPromptPay
    ? '⚠️ พร้อมเพย์ (รอโอนเงิน)'
    : '⚠️ เงินสด (เก็บเงินสดหน้าร้าน)';

  const paperWidth = options.paperWidth || '58mm';
  const bodyWidth = paperWidth === '58mm' ? '54mm' : '76mm';
  const queueFontSize = paperWidth === '58mm' ? '46px' : '52px';

  // Determine source: Walk-in vs Online
  const isWalkIn =
    options.isWalkIn ??
    (order.note?.includes('[POS]') ||
      order.note?.includes('[หน้าร้าน]') ||
      order.studentId === order.vendorId ||
      order.studentId === order.vendor?.ownerId ||
      isPaid);

  const sourceTagStr = isWalkIn ? '🏪 สั่งซื้อหน้าร้าน (Sunmi POS)' : '📱 สั่งออนไลน์ (Campus App)';

  const itemsHtml = order.items
    .map((item) => {
      const optionsStr =
        item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0
          ? `<div style="font-size: 10px; color: #444; margin-left: 8px;">- ${Object.entries(
              item.options,
            )
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}</div>`
          : '';

      return `
        <div style="margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px dashed #bbb;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
            <span>${item.quantity}x ${item.menuItem?.name || 'รายการอาหาร'}</span>
            <span>฿${Number(item.subtotal)}</span>
          </div>
          ${optionsStr}
        </div>
      `;
    })
    .join('');

  const noteHtml = order.note
    ? `
      <div style="margin-top: 6px; padding: 5px; background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; font-size: 11px;">
        <strong>โน้ต:</strong> ${order.note}
      </div>
    `
    : '';

  const customerPhone = order.student?.phone ? ` (${order.student.phone})` : '';
  const customerName = order.student?.fullName || (isWalkIn ? 'ลูกค้าหน้าร้าน' : 'ลูกค้า');

  const slipHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>บัตรคิวอาหาร #${order.queueNumber}</title>
        <style>
          @page {
            size: ${paperWidth} auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Sarabun', 'Prompt', 'Tahoma', -apple-system, sans-serif;
            width: ${bodyWidth};
            margin: 0 auto;
            padding: 6px 2px 16px 2px;
            color: #000;
            background: #fff;
            line-height: 1.25;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .source-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            background: #000;
            color: #fff;
            border-radius: 4px;
            margin-top: 4px;
          }
          .queue-box {
            border: 2.5px solid #000;
            padding: 6px 2px;
            margin: 6px 0;
            text-align: center;
            border-radius: 8px;
            background-color: #fff;
          }
          .queue-title {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .queue-num {
            font-size: ${queueFontSize};
            font-weight: 900;
            line-height: 1.05;
            margin: 2px 0;
            letter-spacing: -1px;
          }
          .order-type {
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            padding: 2px 6px;
            border: 1px solid #000;
            border-radius: 4px;
            margin-top: 2px;
          }
          .divider {
            border-top: 1.5px dashed #000;
            margin: 6px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .payment-banner {
            margin-top: 6px;
            padding: 5px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            border: 1.5px solid #000;
            border-radius: 4px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            font-weight: 900;
            margin-top: 6px;
            padding-top: 4px;
            border-top: 2px solid #000;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #444;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div style="font-size: 15px; font-weight: 900;">${storeName}</div>
          <div class="source-badge">${sourceTagStr}</div>
        </div>

        <!-- Big Queue Box for Sunmi V2 58mm Thermal Print -->
        <div class="queue-box">
          <div class="queue-title">หมายเลขคิว</div>
          <div class="queue-num">#${order.queueNumber}</div>
          <div class="order-type">${orderTypeStr}</div>
        </div>

        <!-- Order Info -->
        <div class="info-row">
          <span>เวลา:</span>
          <span class="bold">${dateStr}</span>
        </div>
        <div class="info-row">
          <span>ลูกค้า:</span>
          <span class="bold">${customerName}${customerPhone}</span>
        </div>
        <div class="info-row">
          <span>เลขอ้างอิง:</span>
          <span style="font-family: monospace;">${order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div class="divider"></div>

        <!-- Items List -->
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">รายการอาหาร:</div>
        ${itemsHtml}

        ${noteHtml}

        <!-- Total Price -->
        <div class="total-row">
          <span>ยอดรวมทั้งสิ้น:</span>
          <span>฿${Number(order.totalPrice).toLocaleString()}</span>
        </div>

        <!-- Payment Status -->
        <div class="payment-banner">
          ${paymentStr}
        </div>

        <div class="footer">
          ขอบคุณที่ใช้บริการ 🙏<br />
          - กรุณาถือบัตรคิวนี้เพื่อรอรับอาหาร -
        </div>
      </body>
    </html>
  `;

  // Use hidden iframe to trigger browser print smoothly without leaving page
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(slipHtml);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print failed:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1200);
      }
    }, 250);
  }
}

