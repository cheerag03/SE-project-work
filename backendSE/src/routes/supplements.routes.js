const express = require('express');
const router = express.Router();
const supplements = require('../controllers/supplements.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// public
router.get('/', supplements.listSupplements);
router.get('/:id', supplements.getSupplement);

// admin (create/update/delete) - requireAuth + admin role check recommended
router.post('/', requireAuth, supplements.createSupplement);
router.put('/:id', requireAuth, supplements.updateSupplement);
router.delete('/:id', requireAuth, supplements.deleteSupplement);

module.exports = router;
