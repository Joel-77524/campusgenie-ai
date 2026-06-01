const { GoogleGenAI } = require('@google/genai');
const AgentLog = require('../models/AgentLog.model');
const AgentAnalytics = require('../models/AgentAnalytics.model');

// Agents
const admissionAgent = require('./agents/admission.agent');
const courseAgent = require('./agents/course.agent');
const scholarshipAgent = require('./agents/scholarship.agent');
const placementAgent = require('./agents/placement.agent');
const campusAgent = require('./agents/campus.agent');
const documentAgent = require('./agents/document.agent');
const supportAgent = require('./agents/support.agent');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INTENT_CLASSIFICATION_PROMPT = `You are the Orchestrator for the AIT Multi-Agent System.
Analyze the user's message and determine which specialized agent(s) should handle it.

Available Agents:
- AdmissionAgent (requirements, deadlines, documents, seat availability, fees)
- CourseAgent (course recommendations, syllabus, branch comparison, faculty)
- ScholarshipAgent (financial aid, scholarships, eligibility)
- PlacementAgent (placements, recruiters, average packages, internships)
- CampusAgent (hostel, navigation, facilities, campus life, clubs)
- DocumentAgent (questions about uploaded prospectuses, specific pdf details)
- SupportAgent (general chatbot support, login issues, website help, pleasantries)

User Message: "{message}"

CRITICAL: Return ONLY a valid JSON object. Do not wrap in markdown or add text outside the JSON.
Format:
{
  "selectedAgents": ["AgentName1", "AgentName2"],
  "confidence": 95,
  "reasoning": "Brief explanation of why these agents were chosen."
}`;

const AGENT_MAP = {
  'AdmissionAgent': admissionAgent,
  'CourseAgent': courseAgent,
  'ScholarshipAgent': scholarshipAgent,
  'PlacementAgent': placementAgent,
  'CampusAgent': campusAgent,
  'DocumentAgent': documentAgent,
  'SupportAgent': supportAgent
};

const processRequest = async (userId, message, conversationHistory, memoryContext, languageCode = 'en') => {
  const startTime = Date.now();
  let intentData = { selectedAgents: ['SupportAgent'], confidence: 50, reasoning: 'Fallback' };

  try {
    // 1. Classify Intent
    const prompt = INTENT_CLASSIFICATION_PROMPT.replace('{message}', message);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let textResponse = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      intentData = JSON.parse(textResponse);
      if (!intentData.selectedAgents || intentData.selectedAgents.length === 0) {
        intentData.selectedAgents = ['SupportAgent'];
      }
    } catch (e) {
      console.error('Failed to parse intent JSON, falling back to SupportAgent', e);
    }

    // 2. Route to Agents
    const agentPromises = intentData.selectedAgents.map(async (agentName) => {
      const agentLogic = AGENT_MAP[agentName];
      if (!agentLogic) return null;
      
      const agentStart = Date.now();
      try {
        const result = await agentLogic.processRequest(message, conversationHistory, memoryContext, languageCode);
        
        // Log Agent Execution
        await AgentLog.create({
          userId,
          agentName,
          intent: agentName,
          confidenceScore: intentData.confidence,
          query: message,
          response: result,
          latencyMs: Date.now() - agentStart,
          status: 'success'
        });
        
        return result;
      } catch (agentErr) {
        console.error(`Error in ${agentName}:`, agentErr);
        await AgentLog.create({
          userId,
          agentName,
          intent: agentName,
          confidenceScore: intentData.confidence,
          query: message,
          latencyMs: Date.now() - agentStart,
          status: 'error'
        });
        return null;
      }
    });

    const agentResponses = await Promise.all(agentPromises);
    const validResponses = agentResponses.filter(r => r !== null);

    // Update Analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const analytics = await AgentAnalytics.findOneAndUpdate(
      { date: today },
      { $inc: { totalRequests: 1 }, $setOnInsert: { agentUsage: {} } },
      { new: true, upsert: true }
    );
    
    intentData.selectedAgents.forEach(agentName => {
      const currentCount = analytics.agentUsage.get(agentName) || 0;
      analytics.agentUsage.set(agentName, currentCount + 1);
    });
    
    // Calculate running average latency
    const totalLatency = Date.now() - startTime;
    if (analytics.avgLatencyMs === 0) {
      analytics.avgLatencyMs = totalLatency;
    } else {
      analytics.avgLatencyMs = Math.round((analytics.avgLatencyMs * (analytics.totalRequests - 1) + totalLatency) / analytics.totalRequests);
    }
    await analytics.save();

    // 3. Aggregate if multiple
    if (validResponses.length === 1) {
      return validResponses[0];
    } else if (validResponses.length > 1) {
      // Aggregate responses using Gemini
      const aggPrompt = `You are the AIT Orchestrator. 
      The user asked: "${message}"
      Multiple specialized agents provided partial answers:
      ${validResponses.map((r, i) => `Agent ${i+1}: ${r}`).join('\n\n')}
      
      Combine these into a single, cohesive, natural response in the ${languageCode} language.`;
      
      const aggResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: aggPrompt,
        config: { temperature: 0.3 }
      });
      return aggResponse.text;
    } else {
      return "I'm sorry, I'm having trouble processing your request right now.";
    }

  } catch (error) {
    console.error('Orchestrator Error:', error);
    throw new Error('Failed to process request through Orchestrator');
  }
};

module.exports = { processRequest };
