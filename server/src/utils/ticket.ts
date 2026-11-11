import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import { config } from '../config.js';

export function createTicketId() { return `TTG-2026-${randomBytes(8).toString('hex').toUpperCase()}`; }
export function ticketPayload(ticketId: string) { const signature = createHmac('sha256', config.TICKET_SECRET).update(ticketId).digest('hex'); return `${ticketId}.${signature}`; }
export function verifyTicketPayload(payload: string) {
  const [ticketId, signature, extra] = payload.split('.');
  if (!ticketId || !signature || extra) return null;
  const expected = createHmac('sha256', config.TICKET_SECRET).update(ticketId).digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, 'hex'); } catch { return null; }
  if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) return null;
  return ticketId;
}
export function makeQrDataUrl(ticketId: string) { return QRCode.toDataURL(ticketPayload(ticketId), { width: 360, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#321019', light: '#ffffff' } }); }
