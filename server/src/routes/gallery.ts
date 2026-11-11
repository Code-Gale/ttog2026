import { Router } from 'express';
import { EventPhotoModel } from '../models/EventPhoto.js';

export const galleryRouter = Router();
galleryRouter.get('/photos', async (_req, res, next) => {
  try { const photos = await EventPhotoModel.find().sort({ uploadedAt: -1 }).limit(20).lean(); return res.json(photos.map(photo => ({ id: photo._id, filename: photo.filename, caption: photo.caption }))); }
  catch (error) { next(error); }
});
