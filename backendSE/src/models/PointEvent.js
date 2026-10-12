const mongoose = require('mongoose');
const { Schema } = mongoose;

const PointEventSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { type: String, required: true }, // e.g., 'completed_workout','daily_login','post_like'
  points: { type: Number, required: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

PointEventSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PointEvent', PointEventSchema);
