const Recommendation = require('../models/Recommendation.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `You are an expert AI academic counselor for Apex Institute of Technology.
Based on the student's profile, recommend 3 suitable B.Tech courses available at our college.
Available courses: CSE, AI & ML, Robotics & AI, ECE, Mechanical Engineering, Civil Engineering.

STUDENT PROFILE:
Marks: {marks}%
Board: {board}
Preferred Subjects: {preferredSubjects}
Career Interests: {careerInterests}
Budget: ₹{budget}
Domain: {preferredDomain}

CRITICAL INSTRUCTION: Return ONLY a valid JSON array of objects. Do not wrap in markdown or add explanations outside the JSON.
{translationInstruction}
Format:
[
  {
    "courseName": "B.Tech in ...",
    "matchPercentage": 95,
    "reasoning": "Detailed explanation of why this course fits their profile...",
    "careerOpportunities": ["Role 1", "Role 2"]
  }
]`;

const generateRecommendations = async (req, res, next) => {
  try {
    const { marks, board, preferredSubjects, careerInterests, budget, preferredDomain } = req.body;
    const userId = req.user.id;
    const language = req.headers['x-language'] || 'en';

    let translationInstruction = '';
    if (language !== 'en') {
      const languageMap = { ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
      translationInstruction = `The values for "reasoning" and "careerOpportunities" MUST be translated into ${languageMap[language]}.`;
    }

    // Build the prompt
    let prompt = PROMPT_TEMPLATE
      .replace('{marks}', marks)
      .replace('{board}', board)
      .replace('{preferredSubjects}', preferredSubjects.join(', '))
      .replace('{careerInterests}', careerInterests.join(', '))
      .replace('{budget}', budget)
      .replace('{preferredDomain}', preferredDomain)
      .replace('{translationInstruction}', translationInstruction);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let textResponse = response.text;
    // Clean markdown if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const recsArray = JSON.parse(textResponse);

    // Save to DB
    const newRec = await Recommendation.create({
      userId,
      profile: { marks, board, preferredSubjects, careerInterests, budget, preferredDomain },
      recommendations: recsArray
    });

    res.status(200).json({ success: true, data: newRec });
  } catch (error) {
    console.error('Recommendation Error:', error);
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await Recommendation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateRecommendations, getHistory };
