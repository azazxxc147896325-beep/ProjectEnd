/**
 * Standard Thai PromptPay EMVCo QR Code Payload Generator
 * Conforms to Bank of Thailand & EMVCo QR Code specification.
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Generate a dynamic Thai PromptPay QR string (EMVCo format)
 * @param target PromptPay ID (Mobile Number e.g. 0812345678 or Citizen ID / Tax ID)
 * @param amount Transaction amount in THB (e.g. 50.00)
 */
export function generatePromptPayPayload(target: string = '0812345678', amount?: number): string {
  // Sanitize target (remove non-digits)
  const cleanTarget = target.replace(/[^0-9]/g, '');

  let aid: string;
  let formattedTarget: string;

  if (cleanTarget.length >= 13) {
    // 13-digit National ID / Tax ID
    aid = 'A000000677010112';
    formattedTarget = cleanTarget.slice(0, 13);
  } else {
    // Mobile Phone Number (formatted to 0066xxxxxxxx)
    aid = 'A000000677010111';
    let phone = cleanTarget;
    if (phone.startsWith('0')) {
      phone = '66' + phone.slice(1);
    }
    formattedTarget = phone.padStart(13, '0');
  }

  // Merchant Account Info (Tag 29)
  const subTag00 = formatTag('00', aid);
  const subTag01 = formatTag('01', formattedTarget);
  const tag29Value = `${subTag00}${subTag01}`;
  const tag29 = formatTag('29', tag29Value);

  // Payload Format Indicator (Tag 00)
  const tag00 = formatTag('00', '01');

  // Point of Initiation (Tag 01): 12 = Dynamic (with amount), 11 = Static
  const tag01 = formatTag('01', amount ? '12' : '11');

  // Transaction Currency (Tag 53): 764 = THB
  const tag53 = formatTag('53', '764');

  // Transaction Amount (Tag 54)
  let tag54 = '';
  if (amount && amount > 0) {
    tag54 = formatTag('54', amount.toFixed(2));
  }

  // Country Code (Tag 58): TH
  const tag58 = formatTag('58', 'TH');

  // Checksum template (Tag 63)
  const rawPayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}6304`;
  const checksum = crc16(rawPayload);

  return `${rawPayload}${checksum}`;
}
