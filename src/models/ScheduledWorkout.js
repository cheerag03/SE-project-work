const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScheduledWorkoutSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  workout: { type: Schema.Types.ObjectId, ref: 'Workout', required: true },
  date: { type: Date, required: true, index: true },
  time: { type: String },
  completed: { type: Boolean, default: false },
  actualDurationMin: { type: Number },
  actualCalories: { type: Number },
  notes: { type: String, default: '' }
}, { timestamps: true });

ScheduledWorkoutSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('ScheduledWorkout', ScheduledWorkoutSchema);
