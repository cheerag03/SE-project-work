const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, trim: true, required: true },
  content: { type: String, default: '' },
  category: { type: String, default: 'general', index: true },
  tags: { type: [String], default: [] },
  images: { type: [String], default: [] },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // store user ids who liked
  pinned: { type: Boolean, default: false },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

// virtual for likes count
PostSchema.virtual('likesCount').get(function(){
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, category: 1 });

module.exports = mongoose.model('Post', PostSchema);
