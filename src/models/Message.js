const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' }, // null for system/bot
  role: { type: String, enum: ['user','therapist','bot','system'], default: 'user' },
  content: { type: String, required: true },
  attachments: { type: [String], default: [] }, // urls
  metadata: { type: Schema.Types.Mixed },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

MessageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
