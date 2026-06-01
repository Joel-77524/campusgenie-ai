const ChatSession = require('../models/ChatSession.model');
const { processRequest } = require('../services/orchestrator.service');
const { updateMemory, getMemoryContext } = require('../services/memory.service');

// @desc    Send a message and get AI response
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Find or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId });
    }

    if (!session) {
      session = await ChatSession.create({
        userId,
        title: message.substring(0, 50),
        messages: [],
      });
    }

    // Get conversation history (exclude system messages)
    const history = session.messages.filter((m) => m.role !== 'system');

    // Step 1: Update Memory with User's Context
    const memory = await updateMemory(userId, message);
    const memoryContext = await getMemoryContext(userId);

    // Step 2: Route request through the Orchestrator
    const language = req.headers['x-language'] || 'en';
    const aiResponse = await processRequest(userId, message, history, memoryContext, language);

    // Step 3: Save messages to session
    session.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );

    // Update title if first message
    if (session.messages.length === 2) {
      session.title = message.substring(0, 60);
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        message: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chat sessions for current user
// @route   GET /api/chat/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user.id,
      isActive: true,
    })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    // Return sessions with message count and last message preview
    const sessionList = sessions.map((s) => ({
      id: s._id,
      title: s.title,
      messageCount: s.messages.length,
      lastMessage: s.messages.at(-1)?.content?.substring(0, 100) || '',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.status(200).json({ success: true, data: sessionList });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a specific session
// @route   GET /api/chat/sessions/:id
// @access  Private
const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/chat/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getSessions, getSession, deleteSession };
