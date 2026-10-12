const express = require('express');
const router = express.Router();
const posts = require('../controllers/posts.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', posts.listPosts);
router.post('/', requireAuth, posts.createPost);
router.get('/:id', posts.getPost);
router.post('/:id/like', requireAuth, posts.toggleLike);
router.delete('/:id', requireAuth, posts.deletePost);

module.exports = router;
