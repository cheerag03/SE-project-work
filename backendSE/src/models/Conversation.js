const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], // usually [userId, therapistId] or just [userId]
  type: { type: String, enum: ['user-therapist','user-bot','group'], default: 'user-bot' },
  title: { type: String },
  metadata: { type: Schema.Types.Mixed },
  lastMessageAt: { type: Date, index: true }
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
