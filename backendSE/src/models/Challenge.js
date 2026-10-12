const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startAt: { type: Date },
  endAt: { type: Date },
  rules: { type: Schema.Types.Mixed }, // e.g., { target: 10, type: 'workouts' }
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  participantsCount: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

ChallengeSchema.index({ startAt: 1, endAt: 1 });

module.exports = mongoose.model('Challenge', ChallengeSchema);
