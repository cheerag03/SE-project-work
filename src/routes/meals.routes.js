const express = require('express');
const router = express.Router();
const meals = require('../controllers/meals.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, meals.getMealsByDate);
router.get('/analytics', requireAuth, meals.mealsAnalytics);
router.post('/analyze-photo', requireAuth, meals.analyzePhoto);
router.post('/recommend-recipes', requireAuth, meals.recommendRecipes);
router.post('/', requireAuth, meals.addMeal);
router.put('/:id', requireAuth, meals.updateMeal);
router.delete('/:id', requireAuth, meals.deleteMeal);

module.exports = router;
