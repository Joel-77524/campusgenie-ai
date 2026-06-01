# 🎓 AI-Powered Multi-Agent College Assistant

A production-grade full-stack MERN application featuring an AI-powered college admission counselor with RAG-based knowledge retrieval and Vapi voice call integration.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| AI Chat | OpenAI GPT-4o-mini + RAG (text-embedding-3-small) |
| Voice Agent | Vapi AI |

---

## 📁 Project Structure

```
collegeChatBot/
├── backend/
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, Login, GetMe
│   │   ├── chat.controller.js    # RAG-powered AI chat
│   │   └── voice.controller.js   # Vapi outbound calls
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect + authorize
│   │   └── error.middleware.js   # Global error handler
│   ├── models/
│   │   ├── User.model.js         # User schema (bcrypt pre-save)
│   │   ├── KnowledgeBase.model.js # College knowledge + embeddings
│   │   └── ChatSession.model.js  # Conversation history
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth/*
│   │   ├── chat.routes.js        # /api/chat/*
│   │   └── voice.routes.js       # /api/voice/*
│   ├── services/
│   │   ├── ai.service.js         # OpenAI embedding + chat completion
│   │   └── retrieval.service.js  # Cosine similarity RAG search
│   ├── utils/seed.js             # Knowledge base seeder (with embeddings)
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables
│
└── frontend/
    ├── src/
    │   ├── api/axios.js           # Axios + JWT interceptors
    │   ├── context/AuthContext.jsx # Auth state + persist
    │   ├── hooks/useChat.js       # Chat state management
    │   ├── components/
    │   │   ├── Navbar.jsx         # Responsive navbar
    │   │   ├── ChatWidget.jsx     # Floating AI chat UI
    │   │   ├── ChatMessage.jsx    # Message bubbles + Markdown
    │   │   ├── VoiceCallModal.jsx # 4-state voice call modal
    │   │   └── ProtectedRoute.jsx
    │   ├── layouts/MainLayout.jsx
    │   ├── pages/
    │   │   ├── Home.jsx           # Hero + features + CTA
    │   │   ├── Login.jsx          # Auth form
    │   │   ├── Signup.jsx         # Auth form + strength meter
    │   │   └── Dashboard.jsx      # Protected user dashboard
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key
- Vapi account (for voice features)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** — Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/collegebot
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-openai-key
VAPI_API_KEY=your-vapi-api-key
VAPI_PHONE_NUMBER_ID=your-vapi-phone-number-id
CLIENT_URL=http://localhost:5173
```

**Frontend** — `frontend/.env` is pre-configured:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Knowledge Base

```bash
cd backend
npm run seed
```

This will:
- Connect to MongoDB Atlas
- Insert 16 college knowledge base entries (courses, fees, placements, etc.)
- Generate OpenAI embeddings for each entry (RAG)

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server: http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, get JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Chat (AI RAG)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/chat/message` | Send message, get AI response | Protected |
| GET | `/api/chat/sessions` | Get all chat sessions | Protected |
| GET | `/api/chat/sessions/:id` | Get specific session | Protected |
| DELETE | `/api/chat/sessions/:id` | Delete session | Protected |

### Voice (Vapi)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/voice/call` | Initiate AI counseling call | Protected |
| GET | `/api/voice/call/:callId` | Get call status | Protected |

### Health
```
GET /api/health  →  { success: true, message: "...", timestamp: "..." }
```

---

## 🧠 How the AI RAG Works

1. **User sends a question** via the chat widget
2. **Embedding generated** using `text-embedding-3-small`
3. **Cosine similarity search** against 16 knowledge base entries
4. **Top 4 relevant chunks** injected into GPT-4o-mini system prompt
5. **Contextual response generated** and saved to chat session

---

## 🎙️ Voice Agent Setup (Vapi)

1. Create account at [app.vapi.ai](https://app.vapi.ai)
2. Purchase/import a phone number in Vapi dashboard
3. Copy the Phone Number ID to `VAPI_PHONE_NUMBER_ID`
4. Copy your API key to `VAPI_API_KEY`
5. (Optional) Create an Assistant in Vapi and set `VAPI_ASSISTANT_ID`

> Without `VAPI_ASSISTANT_ID`, the system uses an inline assistant configuration defined in `voice.controller.js`

---

## 🏗️ Production Deployment

### Backend (Render / Railway)
```bash
# Set env vars in dashboard
# Build command: npm install
# Start command: node server.js
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# dist/ folder is ready to deploy
# Set VITE_API_URL to your production backend URL
```

Update `CLIENT_URL` in backend `.env` to your frontend production URL.

---

## 📚 Knowledge Base Categories

The seeded knowledge base covers:
- **courses** — BTech programs, PG programs, curriculum
- **fees** — Tuition, hostel, mess, refund policy  
- **scholarships** — Merit-based, government, corporate
- **placements** — Statistics, top companies, career center
- **hostel** — Facilities, rules, mess details
- **admission** — Process, eligibility, documents required
- **departments** — CSE, ECE, ME, Civil, EEE, IT
- **facilities** — Campus, sports, digital infrastructure
- **general** — About AIT, contact information

---

## 🛡️ Security Features

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT tokens with configurable expiry
- Input validation using express-validator
- Mongoose schema validation
- Protected routes on both frontend (React Router) and backend (middleware)
- Auto-logout on expired token
- CORS restricted to frontend URL

---

## 📝 License

MIT License — Apex Institute of Technology © 2024
