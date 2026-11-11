import mongoose, { Schema } from 'mongoose';
const eventPhotoSchema = new Schema({ filename: { type: String, required: true }, originalName: { type: String, required: true }, caption: { type: String, trim: true, maxlength: 120, default: '' }, uploadedAt: { type: Date, default: Date.now } });
export const EventPhotoModel = mongoose.model('EventPhoto', eventPhotoSchema);
