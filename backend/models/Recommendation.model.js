const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profile: {
      marks: { type: Number, required: true }, // e.g., 85
      board: { type: String, required: true }, // CBSE, State, etc.
      preferredSubjects: [{ type: String }],
      careerInterests: [{ type: String }],
      budget: { type: Number },
      preferredDomain: { type: String }, // e.g., Software, Hardware, AI
    },
    recommendations: [
      {
        courseName: { type: String, required: true },
        matchPercentage: { type: Number },
        reasoning: { type: String, required: true },
        careerOpportunities: [{ type: String }],
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
