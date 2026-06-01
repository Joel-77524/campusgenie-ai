const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an intelligent and friendly college admission counselor AI assistant for Apex Institute of Technology (AIT). 

Your role is to help students with:
- Admission process and eligibility criteria
- Course information and curriculum details
- Fee structure and payment options
- Scholarship opportunities
- Hostel and campus facilities
- Placement statistics and company partnerships
- Department and faculty information
- Campus life and extracurricular activities

Guidelines:
- Be warm, encouraging, and professional
- Provide accurate, specific information based on the context provided
- If you don't have specific information, say so honestly and suggest contacting the admissions office
- Keep responses concise but complete (2-4 paragraphs max)
- Use bullet points for lists to improve readability
- Always encourage students to apply and highlight the college's strengths
- Address students by name if provided
- Format monetary values in Indian Rupees (₹)

Contact Information (always available):
- Admissions Office: admissions@ait.edu.in
- Phone: +91-80-1234-5678
- Address: Apex Institute of Technology, Tech Park, Bangalore - 560001
- Website: www.ait.edu.in`;

/**
 * Generate embedding vector for a text string
 * Uses Gemini gemini-embedding-2 (3072 dimensions)
 */
const generateEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text.trim(),
    });
    return response.embeddings[0].values;
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generate AI chat response with RAG context
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @param {string} retrievedContext - Relevant knowledge base content
 * @param {string} userQuery - Latest user message
 */
const generateChatResponse = async (conversationHistory, retrievedContext, userQuery, languageCode = 'en') => {
  try {
    const languageMap = {
      en: 'English',
      ml: 'Malayalam',
      hi: 'Hindi',
      ta: 'Tamil',
    };
    const targetLanguage = languageMap[languageCode] || 'English';
    
    // Inject target language at the very beginning of the prompt to strongly enforce it
    const localizedSystemPrompt = `CRITICAL PERSONA INSTRUCTION: You are a native ${targetLanguage} speaker. You MUST generate ALL your responses entirely in ${targetLanguage}. Do not use English unless strictly necessary for technical terms.\n\n` + SYSTEM_PROMPT;
    
    let contextualSystemPrompt = retrievedContext
      ? `${localizedSystemPrompt}\n\n--- RELEVANT COLLEGE INFORMATION ---\n${retrievedContext}\n--- END OF CONTEXT ---\n\nUse the above information to answer the student's question accurately in ${targetLanguage}.`
      : localizedSystemPrompt;

    // Convert history to Gemini format (user/model instead of user/assistant)
    const contents = conversationHistory.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: contextualSystemPrompt,
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Chat generation error:', error.message);
    throw new Error('Failed to generate AI response');
  }
};

module.exports = { generateEmbedding, generateChatResponse };
