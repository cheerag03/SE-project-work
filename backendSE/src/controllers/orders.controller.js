const Order = require('../models/Order');
const Supplement = require('../models/Supplement');

/**
 * Create order (simple version)
 * expects: items = [{ supplementId, qty }]
 * shippingAddress object
 */
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, billingAddress, paymentIntentId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Items required' });

    // fetch supplements to calculate prices and check stock
    const supplementIds = items.map(i => i.supplementId);
    const supplements = await Supplement.find({ _id: { $in: supplementIds } });
    const supplementMap = supplements.reduce((m,s) => { m[s._id] = s; return m; }, {});

    const orderItems = [];
    let subtotal = 0;
    for (const it of items) {
      const s = supplementMap[it.supplementId];
      if (!s) return res.status(400).json({ message: `Supplement ${it.supplementId} not found` });
      const qty = Math.max(1, Number(it.qty || 1));
      const unit = s.priceCents;
      const total = unit * qty;
      orderItems.push({ supplement: s._id, name: s.name, qty, unitPriceCents: unit, totalPriceCents: total });
      subtotal += total;

      // optional: reduce stock (do in transaction for real apps)
      if (s.stock >= 0) {
        s.stock = Math.max(0, s.stock - qty);
        await s.save();
      }
    }

    const shippingCents = 0;
    const taxCents = 0;
    const totalCents = subtotal + shippingCents + taxCents;

    const order = new Order({
      user: userId,
      items: orderItems,
      subtotalCents: subtotal,
      shippingCents,
      taxCents,
      totalCents,
      currency: 'USD',
      paymentIntentId: paymentIntentId || null,
      paymentStatus: paymentIntentId ? 'pending' : 'pending',
      status: 'created',
      shippingAddress,
      billingAddress
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's orders (list)
 */
exports.listOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list all orders with pagination
 */
exports.adminListOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
      Order.countDocuments(filter)
    ]);
    res.json({ orders, total, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Get order by id (owner or admin)
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user._id.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: update order status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.status) order.status = req.body.status;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
