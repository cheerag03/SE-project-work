const Workout = require('../models/Workout');
const ScheduledWorkout = require('../models/ScheduledWorkout');

/**
 * List workouts (catalog)
 */
exports.listWorkouts = async (req, res, next) => {
  try {
    const { category, q, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: 'i' };
    const workouts = await Workout.find(filter).limit(Math.min(500, Number(limit) || 200)).sort({ createdAt: -1 });
    res.json({ workouts });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single workout
 */
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    next(err);
  }
};

/**
 * Schedule workout for current user
 */
exports.schedule = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { workoutId, date, time } = req.body;
    if (!workoutId || !date) return res.status(400).json({ message: 'workoutId and date required' });
    const sched = new ScheduledWorkout({ user: userId, workout: workoutId, date: new Date(date), time: time || '' });
    await sched.save();
    res.status(201).json(sched);
  } catch (err) {
    next(err);
  }
};

/**
 * Get scheduled workouts for user (by date or range)
 */
exports.listScheduled = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dateQ = req.query.date ? new Date(req.query.date) : null;
    const filter = { user: userId };
    if (dateQ) {
      const start = new Date(dateQ); start.setHours(0,0,0,0);
      const end = new Date(dateQ); end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    } else if (req.query.from && req.query.to) {
      filter.date = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
    }
    const scheduled = await ScheduledWorkout.find(filter).populate('workout').sort({ date: 1 });
    res.json({ scheduled });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark scheduled workout as completed (owner only)
 */
exports.completeScheduled = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;
    const { actualDurationMin, actualCalories, notes } = req.body;
    const sched = await ScheduledWorkout.findOneAndUpdate(
      { _id: id, user: userId },
      { completed: true, actualDurationMin: Number(actualDurationMin || 0), actualCalories: Number(actualCalories || 0), notes: notes || '' },
      { new: true }
    );
    if (!sched) return res.status(404).json({ message: 'Scheduled workout not found' });
    res.json(sched);
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel scheduled workout
 */
exports.cancelScheduled = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;
    const sched = await ScheduledWorkout.findOneAndDelete({ _id: id, user: userId });
    if (!sched) return res.status(404).json({ message: 'Scheduled workout not found' });
    res.json({ message: 'Cancelled' });
  } catch (err) {
    next(err);
  }
};
