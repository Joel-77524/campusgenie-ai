const CampusLocation = require('../models/CampusLocation.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `You are the interactive campus guide for Apex Institute of Technology (AIT).
A student is trying to navigate the campus.

From: {from}
To: {to}
Mobility requirements: {mobility} (e.g. Needs wheelchair access)

Generate clear, step-by-step walking directions within the campus. Include landmarks.
Since you don't have a real map, invent a realistic campus layout (e.g., Main Gate -> Admin Block -> Academic Block -> Library -> Hostels -> Cafeteria).

CRITICAL INSTRUCTION: Return ONLY a valid JSON object. Do not wrap in markdown or add text outside the JSON.
{translationInstruction}
Format:
{
  "estimatedTimeMinutes": 5,
  "distanceMeters": 400,
  "steps": [
    "Start at {from}.",
    "Walk past the XYZ landmark.",
    "Arrive at {to}."
  ],
  "accessibilityNotes": "Any notes on ramps, elevators, etc.",
  "nearbyLandmarks": ["Cafeteria", "ATM"]
}`;

const getDirections = async (req, res, next) => {
  try {
    const { from, to, mobility } = req.body;
    const language = req.headers['x-language'] || 'en';

    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'Please provide both starting point and destination.' });
    }

    let translationInstruction = '';
    if (language !== 'en') {
      const languageMap = { ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
      translationInstruction = `All string values in the 'steps', 'accessibilityNotes', and 'nearbyLandmarks' fields MUST be translated into ${languageMap[language]}.`;
    }

    let prompt = PROMPT_TEMPLATE
      .replace('{from}', from)
      .replace('{to}', to)
      .replace('{mobility}', mobility || 'None')
      .replace('{translationInstruction}', translationInstruction);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.2 }
    });

    let textResponse = response.text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(textResponse);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Navigation Error:', error);
    next(error);
  }
};

module.exports = { getDirections };
