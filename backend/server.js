require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const voiceRoutes = require('./routes/voice.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const eligibilityRoutes = require('./routes/eligibility.routes');
const scholarshipRoutes = require('./routes/scholarship.routes');
const comparisonRoutes = require('./routes/comparison.routes');
const navigationRoutes = require('./routes/navigation.routes');
const documentRoutes = require('./routes/document.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// ─── Database Connection ─────────────────────────────────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-language'],
  exposedHeaders: ['x-language']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} → ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AIT College Chatbot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Error Handlers ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`
  🚀 AIT College Chatbot API
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌍 Environment : ${process.env.NODE_ENV || 'development'}
  🔌 Port        : ${PORT}
  📡 URL         : http://localhost:${PORT}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
