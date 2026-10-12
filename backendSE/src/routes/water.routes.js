const express = require('express');
const router = express.Router();
const water = require('../controllers/water.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, water.getWater);
router.post('/', requireAuth, water.setWater);

module.exports = router;
