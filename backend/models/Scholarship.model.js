const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String, // College, State Govt, Central Govt, Private
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: String, // e.g., "50% Tuition Waiver", "₹50,000/year"
      required: true,
    },
    eligibilityCriteria: {
      minMarks: { type: Number },
      maxIncome: { type: Number }, // in LPA
      category: [{ type: String }], // e.g., ['SC', 'ST', 'EWS', 'All']
      achievements: [{ type: String }], // e.g., ['Sports', 'NCC']
    },
    deadline: {
      type: Date,
    },
    applicationLink: {
      type: String,
    },
    tags: [{ type: String, lowercase: true }],
  },
  { timestamps: true }
);

scholarshipSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
