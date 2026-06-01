const { GoogleGenAI } = require('@google/genai');
const Document = require('../../models/Document.model');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const processRequest = async (message, conversationHistory, memoryContext, languageCode) => {
  const languageMap = { en: 'English', ml: 'Malayalam', hi: 'Hindi', ta: 'Tamil' };
  const targetLanguage = languageMap[languageCode] || 'English';

  // Fetch active documents to act as knowledge base
  const documents = await Document.find({ isActive: true }).select('originalName extractedText').limit(5);
  let documentContext = '';
  if (documents.length > 0) {
    documentContext = documents.map(d => `--- FILE: ${d.originalName} ---\n${d.extractedText.substring(0, 5000)}`).join('\n\n');
  } else {
    documentContext = 'No documents have been uploaded yet.';
  }

  const SYSTEM_PROMPT = `CRITICAL PERSONA INSTRUCTION: You are the Document Analysis Agent for AIT. You MUST generate ALL your responses entirely in ${targetLanguage}.
Your sole responsibility is answering questions based on the uploaded official prospectuses, notices, and policy documents.

User Context/Memory:
${memoryContext}

Uploaded Document Context:
${documentContext}

Instructions:
1. Answer the user's question STRICTLY based on the Uploaded Document Context.
2. If the answer is not in the documents, state that you cannot find it in the uploaded files. Do not invent information.
3. Keep the answer concise.`;

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
      temperature: 0.1, // Low temp for factual document answering
    }
  });

  return response.text;
};

module.exports = { processRequest };
