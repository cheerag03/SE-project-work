const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const SupplementSchema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  sku: { type: String, index: true },
  description: { type: String, default: '' },
  priceCents: { type: Number, required: true }, // store price in cents/paise
  currency: { type: String, default: 'USD' },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  benefits: { type: [String], default: [] },
  images: { type: [String], default: [] },
  averageRating: { type: Number, default: 0 },
  reviews: { type: [ReviewSchema], default: [] },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Recalculate averageRating on save
SupplementSchema.methods.recalcRating = function(){
  if (!this.reviews || this.reviews.length === 0) { this.averageRating = 0; return this.averageRating; }
  const sum = this.reviews.reduce((s,r) => s + (r.rating || 0), 0);
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  return this.averageRating;
};

module.exports = mongoose.model('Supplement', SupplementSchema);
