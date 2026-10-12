const express = require('express');
const router = express.Router();
const messages = require('../controllers/messages.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/:id/read', requireAuth, messages.markRead);

module.exports = router;
