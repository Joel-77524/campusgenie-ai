const express = require('express');
const { checkEligibility } = require('../controllers/eligibility.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/check', checkEligibility);

module.exports = router;
