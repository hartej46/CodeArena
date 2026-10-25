# ⚡ CodeArena

> **Adaptive AI-Powered Polyglot Coding Education Platform**  
> Powered by Socratic AI Guidance, Bug DNA Autopsy Diagnostics, Interactive IDE Diff Reviews, and Sandboxed Code Execution.

---

> 🎨 **Project Pitch Deck & Slide Presentation:**  
> Explore the full interactive walkthrough and architecture pitch on [Canva Presentation](https://canva.link/7sws1qjb3m0eon0).

---
## 📖 Table of Contents

- [Overview & Value Proposition](#-overview--value-proposition)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [AI Engine: Dual Provider Setup](#-ai-engine-dual-provider-setup)
  - [1. Ollama Setup (Free & Local)](#1-ollama-setup-free--local)
  - [2. Google GenAI SDK Setup (@google/genai)](#2-google-genai-sdk-setup-googlegenai)
  - [Socratic Prompting & Antigravity IDE Fix Engine](#socratic-prompting--antigravity-ide-fix-engine)
- [Tech Stack](#-tech-stack)
- [Getting Started / Quickstart](#-getting-started--quickstart)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Running the Complete System](#3-running-the-complete-system)
- [Environment Configuration Reference](#-environment-configuration-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Testing & Validation](#-testing--validation)
- [License](#-license)

---

## 🎯 Overview & Value Proposition

Traditional coding platforms often fail learners in two opposing ways:
1. **Generic AI auto-completers** provide full solution code instantly, robbing the student of conceptual synthesis and computational problem-solving (*the "AI dependency trap"*).
2. **Standard Online Judges** return terse, opaque errors like `Execution Failed: SyntaxError` or `Wrong Answer on Test 3` with no educational diagnostics.

**CodeArena** bridges this gap:
- **Never spoils the answer upfront**: It acts as a patient, master tutor using the **Socratic Method** — asking diagnostic questions, pointing to specific line numbers, and giving graduated level-based hints.
- **Bug DNA Diagnostics & JEV Engine**: Every syntax or runtime error is autopsied into actionable root causes (e.g., `SyntaxError: Unterminated string`, `NameError: undefined reference`, `State Divergence Matrix`).
- **Antigravity IDE-Style Fix Review**: When a student gets completely stuck, they can reveal the proposed fix and interactively **[ ✓ Accept Fix ]** or **[ ✕ Reject ]** it with real-time diff replacement directly in their Monaco editor.
- **Cross-Language Learning**: Parallel tracks for **Python 3 Mastery** and **JavaScript ES6+ Core** with isolated runtimes, progress tracking, and mastery analytics.

---

## 🚀 Key Features

### 1. 🤖 Socratic AI Tutor
- **Conversational Relevance**: AI answers conceptual questions, analogies, and questions directly rather than getting locked into a robotic loop.
- **Micro-MCQs & Check-ins**: Generates bite-sized understanding checks embedded in markdown chat.
- **Zero-Spoiler Policy**: Follows strict guardrails prohibiting dumping full code answers unless explicitly requested through the diagnostic autopsy.

### 2. 🧬 Bug DNA Autopsies & State Divergence
- **Instant Deterministic AST Check**: Catches missing colons, mismatched brackets, and unclosed quotes immediately without incurring LLM latency.
- **Bug DNA Panel**: Visualizes error type, category (`SYNTAX`, `LOGIC`, `RUNTIME`), and detection count.
- **Interactive Solution Reveal**: Provides an Antigravity IDE-style proposed code replacement bar with side-by-side diff preview and one-click acceptance.

### 3. 📊 Live Adaptive Dashboard
- **Instant Track Switching**: Toggle between Python 3 and JavaScript ES6+ tracks with real-time synchronized diagnostics, concepts mastered, and upcoming lessons.
- **AI Self-Reliance Score**: Monitors learner autonomy by tracking how often problems are solved independently versus requesting solutions.
- **Continuous Session State**: Remembers previous code sessions so learners can resume exactly where they left off without losing work.

### 4. ⚡ Secure Sandboxed Code Runner
- Executes Python and JavaScript code securely.
- Real-time stdout, stderr, execution time, and memory metrics returned to the student.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    User([Learner Browser]) <-->|React + Tailwind + Monaco| Frontend[Frontend Client :5173]
    Frontend <-->|REST API + JWT Bearer| Backend[Express Backend :5001]
    
    Backend <-->|Prisma ORM 7 + PG Pool| DB[(Neon PostgreSQL)]
    Backend <-->|Code Sandbox Runner| Runner[Node / Python Runtime Sandbox]
    
    Backend --> AIBridge[AI Provider Bridge ai/provider.js]
    AIBridge -->|Local HTTP :11434| Ollama[Ollama Server local]
    AIBridge -->|Google GenAI SDK| Gemini[Google Gemini API]
```

---

## 🧠 AI Engine: Dual Provider Setup

CodeArena features a modular AI provider architecture (`backend/ai/provider.js` & `backend/ai/config.js`) supporting **Ollama** (offline/local) and **Google GenAI SDK** (cloud/production).

You can switch between them anytime simply by setting `AI_PROVIDER` in `backend/.env`.

---

### 1. Ollama Setup (Free & Local)

[Ollama](https://ollama.ai) lets you run open-source large language models locally on your GPU/CPU with zero API costs, complete privacy, and no rate limits.

#### A. Install Ollama
- **macOS / Linux**:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  # Or on macOS with Homebrew:
  brew install ollama
  ```
- **Windows**: Download the official installer from [ollama.com/download](https://ollama.com/download).

#### B. Pull the Recommended Models
We recommend **Llama 3.2** (efficient, fast instruction-following) or **Gemma 2 / Gemma 4**:

```bash
# Recommended default for CodeArena
ollama pull llama3.2:latest

# Or pull Gemma
ollama pull gemma:2b
```

#### C. Start the Ollama Server
Make sure the Ollama daemon is running:
```bash
ollama serve
```
Verify it is active by visiting `http://localhost:11434` or running:
```bash
curl http://localhost:11434/api/tags
```

#### D. Configure `backend/.env` for Ollama
Edit `backend/.env`:
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
JEV_MODEL=llama3.2:latest
OLLAMA_TIMEOUT_MS=60000
```

> **Tip:** If your local machine needs more time to generate responses on complex codebases, adjust `OLLAMA_TIMEOUT_MS=90000` (90 seconds).

---

### 2. Google GenAI SDK Setup (`@google/genai`)

For cloud deployment, ultra-fast responses, and cutting-edge reasoning, CodeArena is fully integrated with Google's official `@google/genai` SDK.

#### A. Get a Google AI Studio API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** and create a new key.

#### B. Configure `backend/.env` for Google GenAI
Edit `backend/.env`:
```env
AI_PROVIDER=google
GOOGLE_API_KEY=AIzaSy...your-gemini-api-key-here
GOOGLE_MODEL=gemini-1.5-flash
```

Supported Google models include:
- `gemini-1.5-flash` *(Recommended: blazing-fast latency, high token rate, low cost)*
- `gemini-1.5-pro` *(High-reasoning model for complex code autopsies)*
- `gemini-2.0-flash-exp` *(Experimental next-gen speed)*

#### C. How CodeArena uses `@google/genai`
Under `backend/ai/provider.js`:
```javascript
const { GoogleGenAI } = require('@google/genai');

async function callGoogle(messages, temperature) {
  const genai = new GoogleGenAI({ apiKey: config.googleKey });
  const response = await genai.models.generateContent({
    model: config.googleModel,
    contents: toGoogleContents(messages),
    config: { temperature },
  });
  return response.text ?? '';
}
```

---

### Socratic Prompting & Antigravity IDE Fix Engine

CodeArena prompts both Ollama and Google GenAI with structured rules:
1. **Rule 0: Direct Relevance**: If the user asks a clarifying question or conceptual analogy, answer directly first.
2. **Socratic Guardrails**: Offer hints in progressive levels:
   - *Level 1*: Guiding observation referencing line number.
   - *Level 2*: Socratic thought-experiment or test case comparison.
   - *Level 3*: Micro-MCQ or targeted structure suggestion.
3. **Bug Autopsy / Proposed Fix**: When a bug autopsy or fix is requested, the engine outputs valid JSON conforming to the Bug DNA schema:
   ```json
   {
     "category": "SYNTAX",
     "title": "Unterminated String Literal",
     "explanation": "Line 2 has an unclosed double quote string.",
     "proposedFix": "const greeting = \"Hello World\";"
   }
   ```
   This is directly consumed by the frontend to render the interactive Antigravity IDE-style accept/reject bar in Monaco!

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Database** | Neon Cloud Serverless PostgreSQL (`pg` driver with SSL) |
| **AI Layer** | Ollama REST Client (`fetch` + `AbortSignal`), Google GenAI SDK (`@google/genai`) |
| **Code Runner** | Secure child process sandbox with isolated `node` and `python3` runtimes |
| **Auth** | JWT (JSON Web Tokens), bcrypt password hashing, Google OAuth2 Identity |

---

## 🚦 Getting Started / Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Python 3**: (for running Python student code)
- **Ollama**: (if using local AI) or **Google Gemini API Key** (if using cloud AI)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify or configure your .env
cp .env.example .env # or edit .env directly

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma db push
```

#### Backend `.env` Template:
```env
PORT=5001
DATABASE_URL="postgresql://user:password@host:5432/neondb?sslmode=require"

# AI Provider ("ollama" or "google")
AI_PROVIDER=ollama

# If using Ollama:
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
JEV_MODEL=llama3.2:latest
OLLAMA_TIMEOUT_MS=60000

# If using Google GenAI:
GOOGLE_API_KEY=
GOOGLE_MODEL=gemini-1.5-flash
```

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

#### Frontend `.env` Template:
```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

### 3. Running the Complete System

#### Start Backend Dev Server:
```bash
cd backend
npm run dev
# Server will start on http://localhost:5001
```

#### Start Frontend Dev Server:
```bash
cd frontend
npm run dev
# App will start on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**!

---

## ⚙️ Environment Configuration Reference

### Backend Variables (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5001` | HTTP port the Express server listens on. |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (Neon or local PG). |
| `AI_PROVIDER` | **Yes** | `ollama` | Active provider: `ollama` or `google`. |
| `OLLAMA_URL` | If Ollama | `http://localhost:11434` | Endpoint of the running Ollama daemon. |
| `OLLAMA_MODEL` | If Ollama | `llama3.2:latest` | Model tag for the Socratic AI Tutor. |
| `JEV_MODEL` | If Ollama | `llama3.2:latest` | Model tag for Bug DNA autopsy evaluation. |
| `OLLAMA_TIMEOUT_MS` | No | `60000` | Timeout in ms before aborting Ollama requests. |
| `GOOGLE_API_KEY` | If Google | — | Google AI Studio API key. |
| `GOOGLE_MODEL` | If Google | `gemini-1.5-flash` | Gemini model name (e.g. `gemini-1.5-flash`). |

### Frontend Variables (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Optional | — | Google Client ID for Google Identity Services login. |

---

## 📁 Project Directory Structure

```text
CodeArena/
├── backend/
│   ├── ai/
│   │   ├── config.js            # Environment loader & provider validation
│   │   └── provider.js          # Direct bridge to @google/genai and Ollama
│   ├── prisma/
│   │   └── schema.prisma        # Database models (User, Course, Lesson, BugDNA, etc.)
│   ├── src/
│   │   ├── controllers/         # API controllers (auth, dashboard, tutor, courses)
│   │   ├── middleware/          # JWT auth middleware, error handling
│   │   ├── routes/              # Route definitions (/api/dashboard, /api/tutor, etc.)
│   │   ├── services/            # Business logic (aiTutorService, dashboardService, etc.)
│   │   └── server.js            # Express server initialization & runner mounting
│   ├── .env                     # Backend environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── auth/                # Auth components & safeStorage adapter
│   │   ├── components/          # Reusable UI (Navbar, ErrorBoundary, Cards)
│   │   ├── home/                # Adaptive Dashboard, Track Switcher, Upcoming Lessons
│   │   ├── tutor/               # Monaco Editor, Chat Panel, Bug DNA Autopsy, Fix Review
│   │   ├── App.jsx              # Main routing & state coordinator
│   │   └── main.jsx             # React DOM entrypoint
│   ├── .env                     # Frontend environment variables
│   ├── vite.config.js           # Vite dev server with proxy to :5001
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## 🧪 Testing & Validation

### 1. Build Verification
```bash
# In frontend/:
npm run build
```

### 2. Test Dashboard Course Switching
1. Navigate to `http://localhost:5173/#home`.
2. Click **Python 3 Mastery** in the sidebar. The main card instantly displays Python 3, 🐍 icon, Python diagnostics, and Python lessons (`Variables & Primitive Types`).
3. Click **JavaScript ES6+ Core**. The main card updates to JavaScript ES6+, ⚡ icon, and JS lessons (`Block Scope & Hoisting Nuances`).

### 3. Test AI Tutor & Antigravity IDE Fix Bar
1. Navigate to **AI Tutor** (`#ai-tutor`).
2. Write intentional broken code (e.g. `print("Hello World)` with missing quote).
3. Run the code or click **Analyze Bug DNA**.
4. Observe the **Bug DNA Diagnostics** panel appear.
5. Click **Reveal Answer & Proposed Fix** to see the interactive review bar:
   - Click **`[ ✓ Accept Fix ]`** to automatically patch your Monaco editor.
   - Click **`[ ✕ Reject ]`** to dismiss the suggestion and attempt solving it yourself.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
