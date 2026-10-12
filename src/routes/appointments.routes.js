const express = require('express');
const router = express.Router();
const appointments = require('../controllers/appointments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, appointments.listAppointments);
router.post('/', requireAuth, appointments.createAppointment);

module.exports = router;
