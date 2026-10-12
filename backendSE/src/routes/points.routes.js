const express = require('express');
const router = express.Router();
const points = require('../controllers/points.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/event', requireAuth, points.addEvent);
router.get('/user/:userId?', requireAuth, points.getUserPoints);
router.get('/leaderboard', points.leaderboard);

module.exports = router;
