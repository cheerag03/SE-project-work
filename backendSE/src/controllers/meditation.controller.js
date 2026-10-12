const MeditationSession = require('../models/MeditationSession');

/**
 * Record completed meditation session
 */
exports.recordSession = async (req, res, next) => {
  try {
    const payload = { user: req.user._id, sessionId: req.body.sessionId || '', title: req.body.title || '', durationSec: Number(req.body.durationSec || 0), completedAt: req.body.completedAt ? new Date(req.body.completedAt) : new Date(), notes: req.body.notes || '' };
    const s = new MeditationSession(payload);
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
};

/**
 * List recent sessions
 */
exports.listSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await MeditationSession.find({ user: userId }).sort({ completedAt: -1 }).limit(200);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
};
