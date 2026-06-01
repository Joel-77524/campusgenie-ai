const KnowledgeBase = require('../models/KnowledgeBase.model');
const { generateEmbedding } = require('./ai.service');

/**
 * Cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Search knowledge base using vector similarity + text fallback
 * @param {string} query - User's question
 * @param {number} topK - Number of results to return
 * @returns {string} - Formatted context string for LLM
 */
const searchKnowledge = async (query, topK = 4) => {
  try {
    // Step 1: Get all active knowledge base entries
    const entries = await KnowledgeBase.find({ isActive: true }).lean();

    if (entries.length === 0) {
      return '';
    }

    let rankedEntries = [];

    // Step 2: Try vector similarity search
    const entriesWithEmbeddings = entries.filter(
      (e) => e.embedding && e.embedding.length > 0
    );

    if (entriesWithEmbeddings.length > 0) {
      const queryEmbedding = await generateEmbedding(query);

      rankedEntries = entriesWithEmbeddings
        .map((entry) => ({
          ...entry,
          score: cosineSimilarity(queryEmbedding, entry.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .filter((e) => e.score > 0.3) // relevance threshold
        .slice(0, topK);
    }

    // Step 3: Fallback to text search if vector search yields insufficient results
    if (rankedEntries.length < 2) {
      const textResults = await KnowledgeBase.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(topK)
        .lean();

      // Merge without duplicates
      const existingIds = new Set(rankedEntries.map((e) => e._id.toString()));
      const additional = textResults.filter(
        (r) => !existingIds.has(r._id.toString())
      );
      rankedEntries = [...rankedEntries, ...additional].slice(0, topK);
    }

    // Step 4: Format context for LLM
    if (rankedEntries.length === 0) return '';

    const context = rankedEntries
      .map(
        (entry) =>
          `[${entry.category.toUpperCase()}] ${entry.title}\n${entry.content}`
      )
      .join('\n\n---\n\n');

    return context;
  } catch (error) {
    console.error('Knowledge search error:', error.message);
    // Non-fatal: return empty context, LLM will still respond
    return '';
  }
};

module.exports = { searchKnowledge };
