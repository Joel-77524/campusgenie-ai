const express = require('express');
const { uploadDocument, getDocuments, toggleDocumentStatus } = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Setup Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs are allowed'), false);
  }
});

router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.patch('/:id/toggle', toggleDocumentStatus);

module.exports = router;
