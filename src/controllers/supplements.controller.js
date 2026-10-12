const Supplement = require('../models/Supplement');

/**
 * List supplements (catalog)
 */
exports.listSupplements = async (req, res, next) => {
  try {
    const q = req.query.q;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Supplement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Supplement.countDocuments(filter)
    ]);
    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Get supplement details
 */
exports.getSupplement = async (req, res, next) => {
  try {
    const s = await Supplement.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: create supplement
 */
exports.createSupplement = async (req, res, next) => {
  try {
    const payload = req.body;
    const s = new Supplement(payload);
    await s.save();
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: update supplement
 */
exports.updateSupplement = async (req, res, next) => {
  try {
    const s = await Supplement.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: delete supplement
 */
exports.deleteSupplement = async (req, res, next) => {
  try {
    const s = await Supplement.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
