const Challenge = require('../models/Challenge');

/**
 * List challenges
 */
exports.listChallenges = async (req, res, next) => {
  try {
    const now = new Date();
    const filter = {};
    if (req.query.active === 'true') filter.startAt = { $lte: now }, filter.endAt = { $gte: now };
    const challenges = await Challenge.find(filter).sort({ startAt: -1 });
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
};

/**
 * Get challenge by id
 */
exports.getChallenge = async (req, res, next) => {
  try {
    const c = await Challenge.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) {
    next(err);
  }
};

/**
 * Join challenge (simply increments participantsCount; in real app create participant record)
 */
exports.joinChallenge = async (req, res, next) => {
  try {
    const id = req.params.id;
    const c = await Challenge.findByIdAndUpdate(id, { $inc: { participantsCount: 1 } }, { new: true });
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true, challenge: c });
  } catch (err) {
    next(err);
  }
};
