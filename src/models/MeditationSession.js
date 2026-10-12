const mongoose = require('mongoose');
const { Schema } = mongoose;

const MeditationSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: String }, // reference to catalog session
  title: { type: String },
  durationSec: { type: Number },
  completedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

MeditationSessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('MeditationSession', MeditationSessionSchema);
