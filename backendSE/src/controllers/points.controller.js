const PointEvent = require('../models/PointEvent');
const User = require('../models/User');

/**
 * Add point event (award points)
 */
exports.addEvent = async (req, res, next) => {
  try {
    let { userId, eventType, points, meta } = req.body;
    if (!userId || userId === 'me') {
      userId = req.user ? req.user._id : null;
    }
    if (!userId || !eventType || !points) return res.status(400).json({ message: 'userId (or authenticated user), eventType and points are required' });
    const pe = await PointEvent.create({ user: userId, eventType, points: Number(points), meta: meta || {} });
    // optionally compute total points (aggregate) and attach to response
    const total = await PointEvent.aggregate([{ $match: { user: pe.user } }, { $group: { _id: '$user', total: { $sum: '$points' } } }]);
    res.status(201).json({ event: pe, total: total[0] ? total[0].total : 0 });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user points and recent events
 */
exports.getUserPoints = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const events = await PointEvent.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    const total = events.reduce((s,e) => s + e.points, 0);
    res.json({ total, events });
  } catch (err) {
    next(err);
  }
};

/**
 * Leaderboard (top users) - aggregate
 */
exports.leaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const agg = await PointEvent.aggregate([
      { $group: { _id: '$user', total: { $sum: '$points' } } },
      { $sort: { total: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { total: 1, 'user._id': 1, 'user.name': 1, 'user.avatarUrl': 1 } }
    ]);
    res.json({ leaderboard: agg });
  } catch (err) {
    next(err);
  }
};
