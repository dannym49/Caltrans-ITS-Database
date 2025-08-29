const mongoose = require('mongoose');

const ITSwhItemSchema = new mongoose.Schema({
  ITSElement:   { type: String, required: true, trim: true },
  manufacturer: { type: String, required: true, trim: true },
  model:        { type: String, required: true, trim: true },
  location:     { type: String, required: true, trim: true },
  quantity:     { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

ITSwhItemSchema.index({ ITSElement: 1 });
ITSwhItemSchema.index({ manufacturer: 1 });
ITSwhItemSchema.index({ location: 1 });
ITSwhItemSchema.index({ model: 1 });

module.exports = mongoose.model('ITSwhItem', ITSwhItemSchema);