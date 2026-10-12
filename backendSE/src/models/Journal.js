const mongoose = require('mongoose');
const { Schema } = mongoose;

const JournalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  prompt: { type: String, default: '' },
  mood: { type: Number }, // optional mood rating
  tags: { type: [String], default: [] }
}, { timestamps: true });

JournalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', JournalSchema);
