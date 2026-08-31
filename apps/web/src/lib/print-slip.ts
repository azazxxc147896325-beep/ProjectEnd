/**
 * Thermal Printer Slip Utility for Campus Food
 * Optimized for 80mm & 58mm POS receipt printers as well as standard desktop printing.
 */

import { Order, OrderType, PaymentMethod, PaymentStatus } from '@campus-food/shared-types';

export function printQueueSlip(order: Order, vendorName?: string) {
  const storeName = vendorName || order.vendor?.name || 'Campus Food';
  const orderTypeStr = order.orderType === OrderType.DINE_IN ? '🍽️ ทานที่ร้าน (DINE-IN)' : '🛍️ สั่งกลับบ้าน (TAKEAWAY)';
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
    ? '⚠️ พร้อมเพย์ (รอการโอนเงิน)'
    : '⚠️ เงินสด (*** ต้องเก็บเงินสดหน้าร้าน ***)';

  const itemsHtml = order.items
    .map((item) => {
      const optionsStr =
        item.options && typeof item.options === 'object' && Object.keys(item.options).length > 0
          ? `<div style="font-size: 11px; color: #444; margin-left: 12px;">- ${Object.entries(
              item.options,
            )
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}</div>`
          : '';

      return `
        <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #ddd;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
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
      <div style="margin-top: 8px; padding: 6px; background-color: #f3f3f3; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
        <strong>โน้ตพิเศษ:</strong> ${order.note}
      </div>
    `
    : '';

  const customerPhone = order.student?.phone ? ` (${order.student.phone})` : '';
  const customerName = order.student?.fullName || 'ลูกค้า';

  const slipHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>ใบแปะคิวอาหาร #${order.queueNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Sarabun', 'Prompt', 'Tahoma', sans-serif;
            width: 76mm;
            margin: 0 auto;
            padding: 8px 4px 16px 4px;
            color: #000;
            background: #fff;
            line-height: 1.3;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .queue-box {
            border: 3px solid #000;
            padding: 8px 4px;
            margin: 8px 0;
            text-align: center;
            border-radius: 8px;
            background-color: #fafafa;
          }
          .queue-title {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .queue-num {
            font-size: 42px;
            font-weight: 900;
            line-height: 1.1;
            margin: 2px 0;
          }
          .order-type {
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            padding: 3px 8px;
            border: 1.5px solid #000;
            border-radius: 4px;
            margin-top: 4px;
          }
          .divider {
            border-top: 1.5px dashed #000;
            margin: 8px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 3px;
          }
          .payment-banner {
            margin-top: 8px;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            border: 1.5px solid #000;
            border-radius: 4px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 2px solid #000;
          }
          .footer {
            margin-top: 14px;
            text-align: center;
            font-size: 11px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div style="font-size: 16px; font-weight: bold;">${storeName}</div>
          <div style="font-size: 11px; color: #555;">ใบระบุหมายเลขคิวและออเดอร์</div>
        </div>

        <!-- Big Queue Box for sticking on food box -->
        <div class="queue-box">
          <div class="queue-title">หมายเลขคิว</div>
          <div class="queue-num">#${order.queueNumber}</div>
          <div class="order-type">${orderTypeStr}</div>
        </div>

        <!-- Order Info -->
        <div class="info-row">
          <span>เวลาสั่ง:</span>
          <span class="bold">${dateStr}</span>
        </div>
        <div class="info-row">
          <span>ลูกค้า:</span>
          <span class="bold">${customerName}${customerPhone}</span>
        </div>
        <div class="info-row">
          <span>รหัสออเดอร์:</span>
          <span>${order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div class="divider"></div>

        <!-- Items -->
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px;">รายการอาหาร:</div>
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
          - ติดใบนี้บนกล่องอาหารเพื่อความสะดวกในการเรียกคิว -
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
          document.body.removeChild(iframe);
        }, 1000);
      }
    }, 250);
  }
}
