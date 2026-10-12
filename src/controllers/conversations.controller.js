const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Create or return conversation between participants (one-to-one)
 */
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { otherParticipantId, type, title } = req.body;
    if (!otherParticipantId) return res.status(400).json({ message: 'otherParticipantId required' });

    // attempt to find existing conversation matching participants (unordered)
    const participants = [userId.toString(), otherParticipantId.toString()].sort();
    const convo = await Conversation.findOne({ participants: { $all: participants, $size: participants.length } });

    if (convo) return res.json(convo);

    const c = new Conversation({ participants: [userId, otherParticipantId], type: type || 'user-therapist', title: title || '' });
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's conversations (list)
 */
exports.listConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const convos = await Conversation.find({ participants: userId }).sort({ lastMessageAt: -1 });
    res.json({ convos });
  } catch (err) {
    next(err);
  }
};

/**
 * Get conversation messages (paginated)
 */
exports.getMessages = async (req, res, next) => {
  try {
    const convoId = req.params.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Number(req.query.limit) || 50);
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversation: convoId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('sender', 'name avatarUrl');
    res.json({ messages: messages.reverse() }); // return chronological
  } catch (err) {
    next(err);
  }
};

/**
 * Post a message to a conversation
 */
exports.postMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // conversationId can come in the body or as a URL param (/:id/messages)
    const conversationId = req.body.conversationId || req.params.id;
    const { content, attachments, role } = req.body;
    if (!conversationId || !content) return res.status(400).json({ message: 'conversationId and content required' });

    const c = await Conversation.findById(conversationId);
    if (!c) return res.status(404).json({ message: 'Conversation not found' });
    // ensure user is participant (or admin)
    if (!c.participants.some(p => p.equals(userId)) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const m = new Message({ conversation: conversationId, sender: userId, content, attachments: attachments || [], role: role || 'user' });
    await m.save();
    c.lastMessageAt = new Date();
    await c.save();
    res.status(201).json(m);
  } catch (err) {
    next(err);
  }
};
