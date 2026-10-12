const express = require('express');
const router = express.Router();
const comments = require('../controllers/comments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// add comment to a post
router.post('/:postId', requireAuth, comments.addComment);

// delete comment
router.delete('/:id', requireAuth, comments.deleteComment);

module.exports = router;
