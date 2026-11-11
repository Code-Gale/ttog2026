import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { stringify } from 'csv-stringify/sync';
import { config } from '../config.js';
import { RegistrationModel } from '../models/Registration.js';
import { EventPhotoModel } from '../models/EventPhoto.js';
import { requireAdmin } from '../middleware/auth.js';
import { verifyTicketPayload } from '../utils/ticket.js';

export const adminRouter = Router();
const signInSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) });
const checkInSchema = z.object({ payload: z.string().min(16).max(300) });
let adminPasswordHash: Promise<string> | undefined;
adminRouter.post('/login', rateLimit({ windowMs: 15 * 60_000, limit: 8, skipSuccessfulRequests: true, standardHeaders: 'draft-8', legacyHeaders: false }), async (req, res, next) => {
  try {
    const input = signInSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ message: 'Enter your organiser email and password.' });
    adminPasswordHash ??= bcrypt.hash(config.ADMIN_PASSWORD, 12);
    const isCorrect = input.data.email.toLowerCase() === config.ADMIN_EMAIL.toLowerCase() && await bcrypt.compare(input.data.password, await adminPasswordHash);
    if (!isCorrect) return res.status(401).json({ message: 'Those sign-in details don’t match.' });
    const token = jwt.sign({ role: 'admin', email: config.ADMIN_EMAIL }, config.JWT_SECRET, { expiresIn: '8h', issuer: 'tomtom-gala', audience: 'tomtom-gala-admin' });
    return res.json({ token, email: config.ADMIN_EMAIL, expiresIn: 8 * 60 * 60 });
  } catch (error) { next(error); }
});

adminRouter.use(requireAdmin);

adminRouter.get('/overview', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const status = typeof req.query.status === 'string' && ['paid', 'pending', 'failed'].includes(req.query.status) ? req.query.status : '';
    const filters: Record<string, unknown> = {};
    if (status) filters.paymentStatus = status;
    if (search) filters.$or = [{ fullName: { $regex: escapeRegex(search), $options: 'i' } }, { email: { $regex: escapeRegex(search), $options: 'i' } }, { phone: { $regex: escapeRegex(search), $options: 'i' } }, { ticketId: { $regex: escapeRegex(search), $options: 'i' } }];
    const [registrations, total, paid, pending, failed, revenue, tickets, checkedIn] = await Promise.all([
      RegistrationModel.find(filters).sort({ createdAt: -1 }).limit(250).lean(),
      RegistrationModel.countDocuments(), RegistrationModel.countDocuments({ paymentStatus: 'paid' }), RegistrationModel.countDocuments({ paymentStatus: 'pending' }), RegistrationModel.countDocuments({ paymentStatus: 'failed' }),
      RegistrationModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: '$tickets' } } }]),
      RegistrationModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$tickets' } } }]),
      RegistrationModel.aggregate([{ $match: { paymentStatus: 'paid', checkedInAt: { $ne: null } } }, { $group: { _id: null, total: { $sum: '$tickets' } } }]),
    ]);
    return res.json({ metrics: { total, paid, pending, failed, revenueKobo: revenue[0]?.total || 0, tickets: tickets[0]?.total || 0, checkedIn: checkedIn[0]?.total || 0 }, registrations });
  } catch (error) { next(error); }
});

adminRouter.post('/check-in', async (req, res, next) => {
  try {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Scan a valid TomTom of Gala ticket QR code.' });
    const ticketId = verifyTicketPayload(parsed.data.payload);
    if (!ticketId) return res.status(400).json({ message: 'This QR code isn’t a valid TomTom of Gala ticket.' });
    const registration = await RegistrationModel.findOne({ ticketId });
    if (!registration) return res.status(404).json({ message: 'This ticket could not be found.' });
    if (registration.paymentStatus !== 'paid') return res.status(402).json({ message: 'This ticket has not been paid for.' });
    if (registration.checkedInAt) return res.status(409).json({ message: 'This ticket was already checked in.', attendee: { fullName: registration.fullName, ticketId: registration.ticketId, checkedInAt: registration.checkedInAt } });
    registration.checkedInAt = new Date(); await registration.save();
    return res.json({ message: 'Welcome to the Royal Affairs.', attendee: { fullName: registration.fullName, ticketId, tickets: registration.tickets, checkedInAt: registration.checkedInAt } });
  } catch (error) { next(error); }
});

adminRouter.get('/export.csv', async (_req, res, next) => {
  try {
    const rows = await RegistrationModel.find().sort({ createdAt: -1 }).lean();
    const csv = stringify(rows.map(row => ({ name: row.fullName, email: row.email, phone: row.phone, gender: row.gender, dressCode: row.dressCode, tickets: row.tickets, totalNGN: row.amount / 100, paymentStatus: row.paymentStatus, ticketId: row.ticketId || '', checkedInAt: row.checkedInAt?.toISOString() || '', registeredAt: row.createdAt?.toISOString() || '' })), { header: true, columns: ['name', 'email', 'phone', 'gender', 'dressCode', 'tickets', 'totalNGN', 'paymentStatus', 'ticketId', 'checkedInAt', 'registeredAt'] });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="tomtom-gala-registrations.csv"'); return res.send(`\ufeff${csv}`);
  } catch (error) { next(error); }
});

const uploadPath = path.resolve(process.cwd(), 'uploads');
await mkdir(uploadPath, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: uploadPath, filename: (_req, file, callback) => callback(null, `${Date.now()}-${randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 8 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, callback) => { if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) callback(new Error('Upload a JPEG, PNG, or WebP image.')); else callback(null, true); } });
adminRouter.get('/photos', async (_req, res, next) => { try { return res.json(await EventPhotoModel.find().sort({ uploadedAt: -1 }).lean()); } catch (error) { next(error); } });
adminRouter.post('/photos', upload.single('photo'), async (req, res, next) => {
  try { if (!req.file) return res.status(400).json({ message: 'Choose a JPEG, PNG, or WebP photo to upload.' }); const caption = typeof req.body.caption === 'string' ? req.body.caption.trim().slice(0, 120) : ''; const photo = await EventPhotoModel.create({ filename: req.file.filename, originalName: path.basename(req.file.originalname).slice(0, 180), caption }); return res.status(201).json(photo); }
  catch (error) { next(error); }
});
adminRouter.delete('/photos/:id', async (req, res, next) => { try { const photo = await EventPhotoModel.findByIdAndDelete(req.params.id); if (!photo) return res.sendStatus(404); const { unlink } = await import('node:fs/promises'); await unlink(path.join(uploadPath, photo.filename)).catch(() => undefined); return res.sendStatus(204); } catch (error) { next(error); } });

function escapeRegex(input: string) { return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
