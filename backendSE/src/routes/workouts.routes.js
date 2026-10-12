const express = require('express');
const router = express.Router();
const workouts = require('../controllers/workouts.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', workouts.listWorkouts);
router.get('/:id', workouts.getWorkout);
router.post('/schedule', requireAuth, workouts.schedule);
router.get('/scheduled', requireAuth, workouts.listScheduled);
router.post('/scheduled/:id/complete', requireAuth, workouts.completeScheduled);
router.delete('/scheduled/:id', requireAuth, workouts.cancelScheduled);

module.exports = router;
