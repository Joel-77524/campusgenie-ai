const express = require('express');
const { findScholarships } = require('../controllers/scholarship.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/find', findScholarships);

module.exports = router;
