const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'courses',
        'fees',
        'scholarships',
        'placements',
        'hostel',
        'admission',
        'departments',
        'faculty',
        'facilities',
        'general',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{ type: String, lowercase: true }],
    // Stores OpenAI text-embedding-3-small vector (1536 dims)
    embedding: {
      type: [Number],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for fallback keyword search
knowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
