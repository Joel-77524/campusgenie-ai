const Document = require('../models/Document.model');
const pdf = require('pdf-parse');
const fs = require('fs');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const { originalname, filename, path, size, mimetype } = req.file;
    const userId = req.user.id;

    // Parse the PDF
    const dataBuffer = fs.readFileSync(path);
    const parsedData = await pdf(dataBuffer);

    // Create DB entry
    const newDoc = await Document.create({
      filename,
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      extractedText: parsedData.text,
      uploadedBy: userId,
      isActive: true
    });

    // Remove the file from local storage to save space, since we have the text
    // Optional: Keep it if you want users to download the original PDF
    fs.unlinkSync(path);

    res.status(201).json({ success: true, data: newDoc });
  } catch (error) {
    console.error('Document Upload Error:', error);
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ isActive: true })
      .select('-extractedText') // Exclude heavy text
      .populate('uploadedBy', 'name email');
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

const toggleDocumentStatus = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    
    doc.isActive = !doc.isActive;
    await doc.save();
    
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, toggleDocumentStatus };
