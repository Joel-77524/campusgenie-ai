const { GoogleGenAI } = require('@google/genai');
const { searchKnowledge } = require('../retrieval.service');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const processRequest = async (message, conversationHistory, memoryContext, languageCode) => {
  const languageMap = { en: 'English', ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
  const targetLanguage = languageMap[languageCode] || 'English';

  const context = await searchKnowledge(message);

  const SYSTEM_PROMPT = `CRITICAL PERSONA INSTRUCTION: You are the Admission Agent for Apex Institute of Technology (AIT). You MUST generate ALL your responses entirely in ${targetLanguage}.
Your sole responsibility is handling queries about the admission process, eligibility requirements, application deadlines, required documents, and seat availability.

User Context/Memory:
${memoryContext}

Relevant College Information:
${context}

Instructions:
1. Answer strictly based on the provided context. If unknown, advise them to contact admissions@ait.edu.in.
2. Be professional and encouraging.
3. If they ask about scholarships or courses directly, politely state you specialize in admissions and the Orchestrator will handle the rest.
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
      temperature: 0.3,
    }
  });

  return response.text;
};

module.exports = { processRequest };
