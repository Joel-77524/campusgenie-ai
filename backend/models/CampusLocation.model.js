const mongoose = require('mongoose');

const campusLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['academic', 'hostel', 'sports', 'admin', 'cafeteria', 'library', 'labs', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    building: {
      type: String,
    },
    floor: {
      type: String,
    },
    nearbyLandmarks: [{ type: String }],
    operatingHours: {
      type: String,
      default: '9:00 AM - 5:00 PM',
    },
    tags: [{ type: String, lowercase: true }],
  },
  { timestamps: true }
);

campusLocationSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('CampusLocation', campusLocationSchema);
