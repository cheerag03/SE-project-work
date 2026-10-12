const express = require('express');
const router = express.Router();
const orders = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, orders.createOrder);
router.get('/', requireAuth, orders.listOrders); // user orders
router.get('/admin', requireAuth, orders.adminListOrders); // admin
router.get('/:id', requireAuth, orders.getOrder);
router.put('/:id/status', requireAuth, orders.updateOrderStatus);

module.exports = router;
