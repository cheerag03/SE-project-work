const Message = require('../models/Message');

exports.markRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;
    const m = await Message.findById(messageId);
    if (!m) return res.status(404).json({ message: 'Message not found' });
    if (!m.readBy.some(r => r.equals(userId))) m.readBy.push(userId);
    await m.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
