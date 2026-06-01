const EligibilityRule = require('../models/EligibilityRule.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `You are an expert AI admission evaluator for Apex Institute of Technology.
Based on the student's profile and the college's admission rules, evaluate their eligibility for the specified course.

RULES:
- General Cutoff: 75% for B.Tech CSE/AI, 60% for Core Engineering (Mechanical, Civil, ECE).
- Category Relaxations: SC/ST gets a 5% relaxation on the cutoff. OBC gets 2%.

STUDENT PROFILE:
Course Applied For: {course}
Marks: {marks}%
Category: {category}
Board: {board}

CRITICAL INSTRUCTION: Return ONLY a valid JSON object. Do not wrap in markdown or add text outside the JSON.
{translationInstruction}
Format:
{
  "isEligible": true/false,
  "eligibilityPercentage": 95, // how close they are to being perfect, or their score vs cutoff
  "explanation": "Detailed explanation of why they are or aren't eligible...",
  "suggestedAlternatives": ["B.Tech ECE", "BCA"] // only if not eligible or border-line
}`;

const checkEligibility = async (req, res, next) => {
  try {
    const { course, marks, category, board } = req.body;
    const language = req.headers['x-language'] || 'en';

    let translationInstruction = '';
    if (language !== 'en') {
      const languageMap = { ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
      translationInstruction = `The values for 'explanation' and 'suggestedAlternatives' MUST be translated into ${languageMap[language]}.`;
    }

    let prompt = PROMPT_TEMPLATE
      .replace('{course}', course)
      .replace('{marks}', marks)
      .replace('{category}', category)
      .replace('{board}', board)
      .replace('{translationInstruction}', translationInstruction);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let textResponse = response.text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(textResponse);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Eligibility Error:', error);
    next(error);
  }
};

module.exports = { checkEligibility };
