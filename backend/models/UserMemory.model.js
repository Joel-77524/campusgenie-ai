const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    language: { type: String, default: 'en' },
    interestedCourses: [{ type: String }],
    targetBudget: { type: Number },
    academicScore: { type: Number },
    extracurriculars: [{ type: String }]
  },
  context: {
    lastInteractedAgent: { type: String },
    interactionCount: { type: Number, default: 0 },
    recentQueries: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);
