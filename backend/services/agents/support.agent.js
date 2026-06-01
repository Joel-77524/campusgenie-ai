const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const processRequest = async (message, conversationHistory, memoryContext, languageCode) => {
  const languageMap = { en: 'English', ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
  const targetLanguage = languageMap[languageCode] || 'English';

  const SYSTEM_PROMPT = `CRITICAL PERSONA INSTRUCTION: You are the Support Agent for the AIT Multi-Agent System. You MUST generate ALL your responses entirely in ${targetLanguage}.
Your responsibility is handling general queries, greetings, technical support, and helping users navigate the website.

User Context/Memory:
${memoryContext}

Instructions:
1. If the user is just saying hello, greet them warmly and introduce the types of agents available (Admission, Course, Scholarship, Placement, Campus).
2. If they are having technical issues (like login problems), provide basic troubleshooting (clear cache, check internet).
3. If their query is completely unrelated to college or technical support, politely bring the conversation back to AIT admissions.
4. Keep the answer concise.`;

  const contents = conversationHistory.slice(-5).map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }));

  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.5,
    }
  });

  return response.text;
};

module.exports = { processRequest };
