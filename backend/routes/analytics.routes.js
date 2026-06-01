const express = require('express');
const { getDashboardStats } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Middleware to ensure user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);

module.exports = router;
