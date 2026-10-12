const Post = require('../models/Post');
const Comment = require('../models/Comment');

/**
 * Create post
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, images } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const post = new Post({ author: req.user._id, title, content: content || '', category: category || 'general', tags: tags || [], images: images || [] });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * List posts (with pagination)
 */
exports.listPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) filter.title = { $regex: req.query.q, $options: 'i' };
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).populate('author', 'name avatarUrl'),
      Post.countDocuments(filter)
    ]);
    res.json({ posts, total, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single post (with comments)
 */
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).populate('author', 'name avatarUrl');
    res.json({ post, comments });
  } catch (err) {
    next(err);
  }
};

/**
 * Like or unlike post
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex(id => id.equals(userId));
    if (idx === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likesCount: post.likes.length, liked: idx === -1 });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete post (owner or admin)
 */
exports.deletePost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.author.equals(userId) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await Comment.deleteMany({ post: post._id });
    await post.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
