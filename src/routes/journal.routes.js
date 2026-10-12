const express = require('express');
const router = express.Router();
const journal = require('../controllers/journal.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, journal.createJournal);
router.get('/', requireAuth, journal.listJournals);
router.delete('/:id', requireAuth, journal.deleteJournal);

module.exports = router;
