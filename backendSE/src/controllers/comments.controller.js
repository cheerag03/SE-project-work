const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * Add comment to a post
 */
exports.addComment = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { content, parent } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = new Comment({ post: postId, author: req.user._id, content, parent: parent || null });
    await comment.save();
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete comment (owner or admin)
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const c = await Comment.findById(id);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    if (!c.author.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Comment.deleteOne({ _id: id });
    // decrement post comment count if possible
    await Post.findByIdAndUpdate(c.post, { $inc: { commentsCount: -1 } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
