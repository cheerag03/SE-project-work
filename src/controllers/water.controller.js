const Water = require('../models/Water');

/**
 * Get water record for a date
 */
exports.getWater = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dateQ = req.query.date ? new Date(req.query.date) : new Date();
    const d = new Date(dateQ); d.setHours(0,0,0,0);
    const record = await Water.findOne({ user: userId, date: d });
    res.json({ water: record || { glasses: 0, unitMl: 250 } });
  } catch (err) {
    next(err);
  }
};

/**
 * Upsert water record
 */
exports.setWater = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, glasses, unitMl } = req.body;
    if (typeof glasses === 'undefined') return res.status(400).json({ message: 'glasses required' });
    const d = new Date(date || new Date()); d.setHours(0,0,0,0);
    const rec = await Water.findOneAndUpdate({ user: userId, date: d }, { $set: { glasses: Number(glasses), unitMl: Number(unitMl || 250) } }, { upsert: true, new: true });
    res.json(rec);
  } catch (err) {
    next(err);
  }
};
