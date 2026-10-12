const express = require('express');
const router = express.Router();
const med = require('../controllers/meditation.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, med.recordSession);
router.get('/', requireAuth, med.listSessions);

module.exports = router;
