const Scholarship = require('../models/Scholarship.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `You are a financial aid and scholarship advisor for Apex Institute of Technology.
Based on the student's profile, recommend 3 relevant scholarships they might be eligible for. 
Feel free to generate realistic mock scholarships (e.g., "AIT Merit Scholarship", "State Merit-cum-Means", "Women in Tech Grant") if real ones don't match perfectly.

STUDENT PROFILE:
Marks: {marks}%
Family Income: ₹{income} per annum
Category: {category}
Achievements: {achievements}

CRITICAL INSTRUCTION: Return ONLY a valid JSON array of objects. Do not wrap in markdown or add text outside the JSON.
{translationInstruction}
Format:
[
  {
    "name": "Scholarship Name",
    "provider": "e.g., AIT / Govt / NGO",
    "amount": "₹50,000 or 50% tuition",
    "eligibility": "Why they are eligible based on their profile",
    "deadline": "2024-08-30",
    "matchPercentage": 90
  }
]`;

const findScholarships = async (req, res, next) => {
  try {
    const { marks, income, category, achievements } = req.body;
    const language = req.headers['x-language'] || 'en';

    let translationInstruction = '';
    if (language !== 'en') {
      const languageMap = { ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
      translationInstruction = `The values for 'name', 'provider', and 'eligibility' MUST be translated into ${languageMap[language]}.`;
    }

    let prompt = PROMPT_TEMPLATE
      .replace('{marks}', marks)
      .replace('{income}', income)
      .replace('{category}', category)
      .replace('{achievements}', achievements || 'None')
      .replace('{translationInstruction}', translationInstruction);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.3 }
    });

    let textResponse = response.text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(textResponse);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Scholarship Error:', error);
    next(error);
  }
};

module.exports = { findScholarships };
