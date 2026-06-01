const mongoose = require('mongoose');

const agentAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true }, // e.g. Daily aggregation
  totalRequests: { type: Number, default: 0 },
  agentUsage: {
    type: Map,
    of: Number, // e.g., { 'AdmissionAgent': 15, 'CourseAgent': 42 }
    default: {}
  },
  avgLatencyMs: { type: Number, default: 0 },
  fallbackCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AgentAnalytics', agentAnalyticsSchema);
