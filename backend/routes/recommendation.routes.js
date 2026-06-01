const express = require('express');
const { generateRecommendations, getHistory } = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', generateRecommendations);
router.get('/history', getHistory);

module.exports = router;
