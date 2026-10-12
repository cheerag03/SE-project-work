const User = require('../models/User');

/**
 * Get current user profile (req.user populated by requireAuth)
 */
exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update current user's profile fields
 */
exports.updateMe = async (req, res, next) => {
  try {
    const updates = {};
    // allow both frontend field names and legacy aliases (heightCm/weightKg)
    const allowed = ['name','age','gender','height','weight','heightCm','weightKg','lifestyle','goals','medicalConditions','medications','avatarUrl','preferences','isOnboarded'];

    for (const key of allowed) {
      if (req.body[key] === undefined) continue;

      // map aliases to canonical fields stored in DB
      if (key === 'heightCm') {
        const val = Number(req.body[key]);
        if (!Number.isNaN(val)) updates.height = val;
        continue;
      }

      if (key === 'weightKg') {
        const val = Number(req.body[key]);
        if (!Number.isNaN(val)) updates.weight = val;
        continue;
      }

      // convert numeric height/weight strings to numbers
      if (key === 'height' || key === 'weight') {
        const val = Number(req.body[key]);
        updates[key] = Number.isNaN(val) ? req.body[key] : val;
        continue;
      }

      updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list users (pagination)
 */
exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const q = req.query.q;
    const filter = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    res.json({ users, total, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: get single user
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: delete user
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
