const mongoose = require('mongoose');
const { Schema } = mongoose;

const WaterSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true }, // day-level
  glasses: { type: Number, default: 0 },
  unitMl: { type: Number, default: 250 } // default glass size
}, { timestamps: true });

WaterSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Water', WaterSchema);
