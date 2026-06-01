require('dotenv').config();
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

async function test() {
  try {
    let prompt = PROMPT_TEMPLATE
      .replace('{item1}', 'CSE')
      .replace('{item2}', 'AI')
      .replace('{category}', 'courses')
      .replace('{translationInstruction}', '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.2 }
    });

    let textResponse = response.text;
    console.log("Raw Response:\n", textResponse);
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(textResponse);
    console.log("Parsed JSON:", result);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
