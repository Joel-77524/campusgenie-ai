const express = require('express');
const { generateComparison } = require('../controllers/comparison.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/generate', generateComparison);

module.exports = router;
