const Journal = require('../models/Journal');

/**
 * Create journal entry
 */
exports.createJournal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payload = { user: userId, title: req.body.title || '', content: req.body.content || '', prompt: req.body.prompt || '', mood: req.body.mood, tags: req.body.tags || [] };
    const j = new Journal(payload);
    await j.save();
    res.status(201).json(j);
  } catch (err) {
    next(err);
  }
};

/**
 * List user's journal entries
 */
exports.listJournals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const entries = await Journal.find({ user: userId }).sort({ createdAt: -1 }).limit(200);
    res.json({ entries });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete journal
 */
exports.deleteJournal = async (req, res, next) => {
  try {
    const id = req.params.id;
    const j = await Journal.findOneAndDelete({ _id: id, user: req.user._id });
    if (!j) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
