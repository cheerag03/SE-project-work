const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expertName: { type: String, required: true },
  expertRole: { type: String, required: true },
  dateTime: { type: Date, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

AppointmentSchema.index({ user: 1, dateTime: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
