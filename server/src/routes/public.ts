import { Router } from 'express';
import { z } from 'zod';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { RegistrationModel } from '../models/Registration.js';
import { config } from '../config.js';
import { createTicketId, makeQrDataUrl } from '../utils/ticket.js';
import { sendTicketEmail } from '../utils/email.js';

export const publicRouter = Router();
export const registrationInput = z.object({ fullName: z.string().trim().min(2).max(100), email: z.email().max(254), phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/), gender: z.enum(['male', 'female']), tickets: z.number().int().min(1).max(10), dressCode: z.enum(['burgundy', 'baby-pink']) }).refine(v => (v.gender === 'male' && v.dressCode === 'burgundy') || (v.gender === 'female' && v.dressCode === 'baby-pink'), { message: 'Please choose the dress-code colour that matches the event guidance.', path: ['dressCode'] });
const PRICE_KOBO = 300000;

publicRouter.post('/initialize', async (req, res, next) => {
  try {
    const input = registrationInput.parse(req.body);
    const reference = `TTG-${Date.now().toString(36).toUpperCase()}-${randomBytes(5).toString('hex').toUpperCase()}`;
    const amount = input.tickets * PRICE_KOBO;
    const registration = await RegistrationModel.create({ ...input, email: input.email.toLowerCase(), amount, reference, paymentStatus: 'pending' });
    const response = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: registration.email, amount, currency: 'NGN', reference, callback_url: `${config.PUBLIC_SITE_URL}/ticket/${encodeURIComponent(reference)}?verify=1`, metadata: { registrationReference: reference, tickets: registration.tickets } }), signal: AbortSignal.timeout(10000) });
    const result = await response.json() as { status?: boolean; message?: string; data?: { authorization_url?: string } };
    if (!response.ok || !result.status || !result.data?.authorization_url) { registration.paymentStatus = 'failed'; await registration.save(); return res.status(502).json({ message: 'Secure checkout is temporarily unavailable. Please try again.' }); }
    return res.status(201).json({ reference, authorizationUrl: result.data.authorization_url, amount });
  } catch (error) { next(error); }
});

async function settlePayment(reference: string) {
  let registration = await RegistrationModel.findOne({ reference });
  if (!registration) return { status: 404 as const, body: { message: 'We could not find this registration.' } };
  if (registration.paymentStatus !== 'paid') {
    const verification = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}` }, signal: AbortSignal.timeout(10000) });
    const result = await verification.json() as { status?: boolean; message?: string; data?: { status?: string; reference?: string; amount?: number; currency?: string; channel?: string } };
    if (!verification.ok || !result.status) return { status: 502 as const, body: { message: 'Payment verification is temporarily unavailable. Please refresh in a moment.' } };
    if (result.data?.status !== 'success' || result.data.reference !== registration.reference || result.data.amount !== registration.amount || result.data.currency !== 'NGN') return { status: 402 as const, body: { message: 'Payment has not been confirmed. Your ticket will appear here once payment is complete.' } };
    const settled = await RegistrationModel.findOneAndUpdate({ _id: registration._id, paymentStatus: { $ne: 'paid' } }, { $set: { paymentStatus: 'paid', ticketId: registration.ticketId || createTicketId(), paymentChannel: result.data.channel || null } }, { new: true });
    registration = settled || await RegistrationModel.findById(registration._id);
    if (!registration) return { status: 404 as const, body: { message: 'We could not find this registration.' } };
  }
  if (!registration.emailSentAt && registration.ticketId) {
    const now = new Date();
    const claim = await RegistrationModel.updateOne({ _id: registration._id, emailSentAt: null, $or: [{ emailSendingAt: null }, { emailSendingAt: { $lt: new Date(now.getTime() - 5 * 60_000) } }] }, { $set: { emailSendingAt: now } });
    if (claim.modifiedCount) {
      try {
        await sendTicketEmail(registration as unknown as import('../models/Registration.js').Registration & { ticketId: string });
        await RegistrationModel.updateOne({ _id: registration._id }, { $set: { emailSentAt: new Date() }, $unset: { emailSendingAt: 1 } });
      } catch (error) {
        await RegistrationModel.updateOne({ _id: registration._id, emailSentAt: null }, { $unset: { emailSendingAt: 1 } });
        console.error('Ticket email delivery failed:', error instanceof Error ? error.message : 'unknown error');
      }
      registration = (await RegistrationModel.findById(registration._id)) || registration;
    }
  }
  return { status: 200 as const, body: { reference: registration.reference, fullName: registration.fullName, email: registration.email, phone: registration.phone, gender: registration.gender, dressCode: registration.dressCode, tickets: registration.tickets, amount: registration.amount, ticketId: registration.ticketId, paymentStatus: registration.paymentStatus, checkedInAt: registration.checkedInAt, emailSent: Boolean(registration.emailSentAt), qrCode: await makeQrDataUrl(registration.ticketId!) } };
}

publicRouter.get('/verify/:reference', async (req, res, next) => { try { const result = await settlePayment(req.params.reference); return res.status(result.status).json(result.body); } catch (error) { next(error); } });

publicRouter.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.get('x-paystack-signature');
    if (!signature || !Buffer.isBuffer(req.body)) return res.sendStatus(400);
    const expected = createHmac('sha512', config.PAYSTACK_SECRET_KEY).update(req.body).digest();
    let provided: Buffer; try { provided = Buffer.from(signature, 'hex'); } catch { return res.sendStatus(401); }
    if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) return res.sendStatus(401);
    const event = JSON.parse(req.body.toString('utf8')) as { event?: string; data?: { reference?: string } };
    if (event.event === 'charge.success' && event.data?.reference) { await settlePayment(event.data.reference); }
    return res.sendStatus(200);
  } catch (error) { next(error); }
});
