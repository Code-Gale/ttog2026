import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'node:path';
import { config } from './config.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { galleryRouter } from './routes/gallery.js';
import { isProduction } from './config.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: isProduction ? undefined : false }));
const allowedOrigins = new Set([
  config.CLIENT_ORIGIN,
  config.PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.100.168:3000',
].filter(Boolean));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '64kb' }));
app.use(express.json({ limit: '32kb', verify: (req, _res, buffer) => { (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), { maxAge: isProduction ? '7d' : 0, index: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'tomtom-gala-api' }));
app.use('/api/payments', rateLimit({ windowMs: 60_000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false }), publicRouter);
app.use('/api/admin', rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }), adminRouter);
app.use('/api/gallery', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }), galleryRouter);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ message: 'Please check the information and try again.' });
  if (error instanceof mongoose.Error || (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError')) return res.status(400).json({ message: 'Please check the information and try again.' });
  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) return res.status(409).json({ message: 'This registration already exists. Please contact the organisers.' });
  if (error && typeof error === 'object' && 'name' in error && error.name === 'MulterError') return res.status(400).json({ message: 'Photos must be JPEG, PNG, or WebP and no larger than 8 MB.' });
  if (error instanceof Error && error.message.startsWith('Upload a JPEG')) return res.status(400).json({ message: error.message });
  console.error('Request failed:', error instanceof Error ? error.message : 'unknown error');
  return res.status(500).json({ message: 'Something went wrong. Please try again shortly.' });
});

if (config.NODE_ENV !== 'test') {
  await mongoose.connect(config.MONGODB_URI);
  app.listen(config.PORT, () => console.log(`TomTom of Gala API listening on port ${config.PORT}`));
}

export { app };
