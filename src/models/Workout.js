const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkoutSchema = new Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, lowercase: true, index: true }, // optional friendly URL
  description: { type: String, default: '' },
  durationMin: { type: Number, default: 0 },
  caloriesBurn: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  videoUrl: { type: String },
  thumbnail: { type: String },
  category: { type: String, default: 'general', index: true },
  equipment: { type: [String], default: [] },
  tags: { type: [String], default: [] }
}, { timestamps: true });

WorkoutSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Workout', WorkoutSchema);
