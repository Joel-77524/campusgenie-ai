const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentName: { type: String, required: true },
  intent: { type: String, required: true },
  confidenceScore: { type: Number },
  query: { type: String, required: true },
  response: { type: String },
  latencyMs: { type: Number },
  status: { type: String, enum: ['success', 'error', 'fallback'], default: 'success' }
}, { timestamps: true });

module.exports = mongoose.model('AgentLog', agentLogSchema);
