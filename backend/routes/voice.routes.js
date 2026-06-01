const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { initiateCall, getCallStatus } = require('../controllers/voice.controller');

const router = express.Router();

router.use(protect);

router.post('/call', initiateCall);
router.get('/call/:callId', getCallStatus);

module.exports = router;
