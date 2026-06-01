const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
} = require('../controllers/chat.controller');

const router = express.Router();

// All chat routes are protected
router.use(protect);

router.post('/message', sendMessage);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id', deleteSession);

module.exports = router;
