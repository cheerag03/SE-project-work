const mongoose = require('mongoose');
const { Schema } = mongoose;

const MealSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, trim: true, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  mealType: { type: String, enum: ['breakfast','lunch','dinner','snack'], default: 'snack' },
  date: { type: Date, required: true, index: true }, // store day-time; queries typically use date range
  time: { type: String }, // optional HH:MM string
  source: { type: String, enum: ['fooddb','recipe','custom'], default: 'custom' },
  planned: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed } // for any external food DB ids, raw nutrition object
}, { timestamps: true });

MealSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Meal', MealSchema);
