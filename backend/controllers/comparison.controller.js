const ComparisonData = require('../models/ComparisonData.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_TEMPLATE = `You are an expert academic advisor for Apex Institute of Technology.
The user wants to compare two items: {item1} and {item2}. They are comparing {category}.

Generate a detailed, objective side-by-side comparison. Include specific metrics like fees, placements, pros, and cons.
If you don't have exact real-world data, generate realistic data suitable for an engineering college context.

CRITICAL INSTRUCTION: Return ONLY a valid JSON object. Do not wrap in markdown or add text outside the JSON.
{translationInstruction}
Format:
{
  "summary": "A brief overview of how they compare...",
  "comparison": [
    {
      "metric": "Fees",
      "item1Value": "₹1,50,000/yr",
      "item2Value": "₹1,20,000/yr"
    },
    {
      "metric": "Placement Rate",
      "item1Value": "95%",
      "item2Value": "88%"
    }
  ],
  "recommendation": "Final verdict or recommendation based on common student goals."
}`;

const generateComparison = async (req, res, next) => {
  try {
    const { item1, item2, category } = req.body;
    const language = req.headers['x-language'] || 'en';

    if (!item1 || !item2) {
      return res.status(400).json({ success: false, message: 'Please provide both items to compare.' });
    }

    let translationInstruction = '';
    if (language !== 'en') {
      const languageMap = { ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
      translationInstruction = `All string values (including 'summary', 'metric', 'item1Value', 'item2Value', and 'recommendation') MUST be translated into ${languageMap[language]}.`;
    }

    let prompt = PROMPT_TEMPLATE
      .replace('{item1}', item1)
      .replace('{item2}', item2)
      .replace('{category}', category || 'courses')
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
    console.error('Comparison Error:', error);
    
    // Check if it's a Gemini API error
    if (error.status === 503 || error.message?.includes('503')) {
      return res.status(503).json({ 
        success: false, 
        message: 'The AI model is currently experiencing high demand. Please try comparing again in a few moments.' 
      });
    }

    res.status(500).json({ success: false, message: 'Failed to generate comparison. Please try again later.' });
  }
};

module.exports = { generateComparison };
