const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // threaded comments
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

CommentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
