const mongoose = require('mongoose');

const comparisonDataSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['course', 'department', 'hostel'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    metrics: {
      fees: { type: String },
      duration: { type: String },
      placementRate: { type: String },
      avgPackage: { type: String },
      topRecruiters: [{ type: String }],
      intakeCapacity: { type: Number },
      features: [{ type: String }], // Pros/Highlights
      drawbacks: [{ type: String }], // Cons/Limitations
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComparisonData', comparisonDataSchema);
