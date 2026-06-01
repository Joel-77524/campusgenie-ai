const UserMemory = require('../models/UserMemory.model');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MEMORY_EXTRACTION_PROMPT = `You are a memory extraction module.
Analyze the user's latest message and extract any persistent preferences or facts.
Current Memory: {currentMemory}
Latest Message: "{message}"

Return a JSON object containing ONLY the updated memory fields if new info is found. Do not include anything else.
Format:
{
  "interestedCourses": ["course1", "course2"],
  "targetBudget": 500000,
  "academicScore": 85,
  "extracurriculars": ["sports", "music"]
}`;

const updateMemory = async (userId, message) => {
  try {
    let memory = await UserMemory.findOne({ userId });
    
    if (!memory) {
      memory = new UserMemory({ userId, preferences: {}, context: { interactionCount: 0, recentQueries: [] } });
    }

    // Update basic context
    memory.context.interactionCount += 1;
    memory.context.recentQueries.push(message);
    if (memory.context.recentQueries.length > 5) {
      memory.context.recentQueries.shift();
    }

    // Only extract preferences every few interactions or if it looks like they are stating a fact
    // To save API calls, we'll do it if there's numbers or keywords like "interested", "score", "budget"
    const keywords = ['interested', 'want to study', 'marks', 'score', 'got', 'budget', 'fee', 'sports', 'ncc'];
    const shouldExtract = keywords.some(k => message.toLowerCase().includes(k));

    if (shouldExtract) {
      const prompt = MEMORY_EXTRACTION_PROMPT
        .replace('{currentMemory}', JSON.stringify(memory.preferences))
        .replace('{message}', message);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.1 }
      });

      let textResponse = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const extracted = JSON.parse(textResponse);
        if (extracted.interestedCourses) memory.preferences.interestedCourses = [...new Set([...memory.preferences.interestedCourses, ...extracted.interestedCourses])];
        if (extracted.targetBudget) memory.preferences.targetBudget = extracted.targetBudget;
        if (extracted.academicScore) memory.preferences.academicScore = extracted.academicScore;
        if (extracted.extracurriculars) memory.preferences.extracurriculars = [...new Set([...(memory.preferences.extracurriculars || []), ...extracted.extracurriculars])];
      } catch (e) {
        console.error('Failed to parse memory extraction JSON', e);
      }
    }

    await memory.save();
    return memory;
  } catch (error) {
    console.error('Memory Update Error:', error);
    // Don't throw, just return null so it doesn't break the main flow
    return null;
  }
};

const getMemoryContext = async (userId) => {
  const memory = await UserMemory.findOne({ userId });
  if (!memory) return 'No prior context available.';
  
  return `User Preferences: ${JSON.stringify(memory.preferences)}`;
};

module.exports = { updateMemory, getMemoryContext };
