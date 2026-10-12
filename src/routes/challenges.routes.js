const express = require('express');
const router = express.Router();
const challenges = require('../controllers/challenges.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', challenges.listChallenges);
router.get('/:id', challenges.getChallenge);
router.post('/:id/join', requireAuth, challenges.joinChallenge);

module.exports = router;
