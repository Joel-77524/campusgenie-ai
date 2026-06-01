const express = require('express');
const { getDirections } = require('../controllers/navigation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/directions', getDirections);

module.exports = router;
