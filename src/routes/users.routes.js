const express = require('express');
const router = express.Router();
const users = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const auth = require('../middleware/auth'); // your JWT auth middleware

// current user
router.get('/me', requireAuth, users.getMe);
router.put('/me', requireAuth, users.updateMe);

// admin endpoints (protect with role check in middleware if desired)
router.get('/', requireAuth, users.listUsers);
router.get('/:id', requireAuth, users.getUser);
router.delete('/:id', requireAuth, users.deleteUser);

// Note: update endpoint handled by controller above. Removed duplicate inline handler to avoid conflicts.

module.exports = router;
