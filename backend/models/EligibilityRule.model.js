const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    baseCutoff: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    categoryRelaxation: {
      SC: { type: Number, default: 5 }, // 5% relaxation
      ST: { type: Number, default: 5 },
      OBC: { type: Number, default: 2 },
      General: { type: Number, default: 0 },
    },
    requiredSubjects: [{ type: String }], // e.g., ['Physics', 'Mathematics']
    alternatives: [{ type: String }], // e.g., ['B.Tech IT', 'BCA']
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EligibilityRule', eligibilityRuleSchema);
