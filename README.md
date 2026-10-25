# ⚡ CodeArena

> **An AI-powered interactive coding arena and intelligent learning platform with real-time execution, Socratic tutoring, and adaptive skill mastery.**

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_+_Prisma_7-336791?logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.0_/_Ollama-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Judge0](https://img.shields.io/badge/Code_Runner-Judge0_CE-FF6B6B)](https://judge0.com/)

---

## 📽️ Project Presentation & Pitch Deck

- 📊 **Presentation Slides (PPT)**: [CodeArena Pitch Deck & Demo Slides](https://1drv.ms/p/c/b4661e7120673040/IQDmmqIkZAhxQqGstbF4eEwnAcnxBhwnZV855aAyNMdDmYI?e=rS18lK&nav=eyJzSWQiOjI1NiwiY0lkIjoxMDk4NTcyMjJ9)

---

## 📖 Overview

**CodeArena** is a full-stack educational coding platform designed to bridge the gap between theoretical computer science and hands-on algorithm mastery. Combining a bold **neo-brutalist interface** with an **adaptive Socratic AI tutor**, CodeArena provides students with real-time compiler feedback, progressive hint ladders, and granular concept mastery tracking.

Whether practicing algorithms, troubleshooting edge cases, or following structured course paths, students receive instant execution feedback and contextual AI mentorship without spoiling the solution.

---

## ✨ Key Features

### 🧠 Socratic AI Tutor & Decision Engine
- **Progressive Hint Ladder**: Progressive hint disclosure (Hint 1 $\rightarrow$ Hint 2 $\rightarrow$ Solution) keeps students thinking rather than copying answers.
- **Context-Aware Code Assistance**: Automatically reads the active editor buffer, programming language, and prompt to deliver targeted explanations.
- **One-Click Code Fixer**: Seamlessly injects suggested corrections and optimizations directly into the editor.
- **Guardrails & Anti-Cheat**: Integrated **Jev Decision Engine** catches gibberish, off-topic requests, or non-educational prompts.
- **Dual AI Provider Architecture**: Run with **Google Gemini (`gemini-2.0-flash`)** in production or local **Ollama (`gemma2:9b`)** for privacy and offline usage.

### ⚡ Real-Time Multi-Language Code Execution
- **Multi-Language Support**: Compile and run Python 3, JavaScript (Node.js), C++, C, and Java.
- **Hybrid Execution Engine**: Seamlessly executes via **Judge0 Community Edition** with zero-config fallback to a sandboxed local runner.
- **Live Terminal Metrics**: Inspect stdout, stderr, execution duration (ms), memory footprint (MB), and execution status (`Accepted`, `Runtime Error`, `Time Limit Exceeded`).

### 📈 Adaptive Curriculum & Mastery Tracking
- **Granular Skill Mastery**: Tracks student proficiency per concept (Core, Weakness remediation, Logic gaps, and Time complexity).
- **Automated Mistake Taxonomy**: Classifies errors into syntax, logic, runtime, and style categories for targeted revision.
- **Streak & Activity Engine**: Tracks continuous practice streaks and daily active coding sessions.

### 🎨 Neo-Brutalist Visual Design
- High-contrast, tactile UI inspired by modern neo-brutalism.
- Bold 2px/3px borders, hard drop shadows (`shadow-[3px_3px_0px_#0F172A]`), vibrant palette tokens, and animated state transitions.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React 19 + Tailwind v4 + Vite)"]
        UI[Neo-Brutalist UI]
        Editor[Monaco/Code Editor]
        Terminal[Interactive Console]
        Tutor[AI Tutor Drawer]
    end

    subgraph Server["Backend (Express 5 + Node.js)"]
        Auth[Auth & JWT Middleware]
        RateLimit[Rate Limiter & Helmet]
        Router[API Gateway / Router]
        AI_Svc[AI Tutor Service]
        Exec_Svc[Code Execution Service]
        Course_Svc[Course & Progress Service]
    end

    subgraph External["Engines & Databases"]
        Postgres[(PostgreSQL via Prisma 7)]
        Gemini[Google Gemini / Ollama]
        Judge0[Judge0 CE / Local Sandbox]
    end

    UI --> Router
    Editor --> Exec_Svc
    Tutor --> AI_Svc
    Router --> Auth
    Router --> RateLimit

    AI_Svc --> Gemini
    Exec_Svc --> Judge0
    Course_Svc --> Postgres
    Auth --> Postgres
    Exec_Svc --> Terminal
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios |
| **Backend** | Node.js, Express 5, Helmet, CORS, Express-Rate-Limit, Zod |
| **Database & ORM** | PostgreSQL, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing |
| **AI Models** | `@google/genai` (Gemini 2.0 Flash), Ollama (`gemma2:9b`), Jev Decision Engine |
| **Execution Sandbox**| Judge0 CE (Docker) + Sandboxed Node `child_process` runner |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Docker](https://www.docker.com/) *(optional, for Judge0 CE)*
- [Ollama](https://ollama.com/) *(optional, for local LLM inference)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CodeArena.git
cd CodeArena
```

---

### 2. Backend Setup

1. **Navigate to the backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in `backend/` based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Configure the variables in `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codearena?schema=public"

   # AI Provider: "google" or "ollama"
   AI_PROVIDER=google

   # If using Google GenAI
   GOOGLE_API_KEY=your_google_api_key_here
   GOOGLE_MODEL=gemini-2.0-flash

   # If using local Ollama
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=gemma2:9b

   # JWT Secret
   JWT_SECRET=super_secret_jwt_key_change_in_production

   # Optional Judge0 URL
   JUDGE0_URL=http://localhost:2358
   ```

3. **Run Prisma Migrations & Generate Client:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start the backend server:**
   ```bash
   # Development mode with watch
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. **Open a new terminal and navigate to `frontend`:**
   ```bash
   cd frontend
   npm install
   ```

2. **Launch the Vite development server:**
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user with email and password |
| `POST` | `/api/auth/login` | Login and receive a JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### 🤖 AI Tutor & Chat (`/api/ai` & `/api/chat`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/health` | Check AI provider connectivity and readiness |
| `POST` | `/api/ai/chat` | Send student prompt & code context to AI Tutor |
| `POST` | `/api/ai/evaluate` | Evaluate student code submission against constraints |
| `GET` | `/api/chat/history` | Retrieve student chat session history |

### 💻 Code Execution (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/run` | Execute code with optional `stdin` input |
| `POST` | `/api/submit` | Evaluate code against test cases |

### 📚 Courses & Progress (`/api/courses` & `/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List all available programming courses |
| `GET` | `/api/courses/:slug` | Retrieve course details with concepts & lessons |
| `GET` | `/api/dashboard` | Fetch user progress, concept mastery, and streaks |

---

## 📂 Project Structure

```text
CodeArena/
├── README.md               # Main project documentation & PPT link
├── TODO.md                 # Project roadmap and technical specifications
├── backend/
│   ├── .env.example        # Environment variables template
│   ├── index.js            # Alternate entry point
│   ├── package.json        # Backend dependencies & scripts
│   ├── prisma/
│   │   └── schema.prisma   # PostgreSQL database schema & models
│   └── src/
│       ├── app.js          # Express app configuration & middlewares
│       ├── server.js       # HTTP server initialization
│       ├── controllers/    # Request controllers
│       ├── middleware/     # Auth, rate limiting & error handlers
│       ├── routes/         # Express API route modules
│       └── services/       # AI Tutor, Execution & Course services
└── frontend/
    ├── package.json        # Frontend dependencies & scripts
    ├── vite.config.js      # Vite build configuration
    └── src/
        ├── App.jsx         # App router and session management
        ├── index.css       # Tailwind CSS & global design tokens
        ├── auth/           # Login / Register components & API
        ├── home/           # Student dashboard & course explorer
        └── tutor/          # Code editor, terminal & AI Tutor workspace
```

---

## 🔗 Resources & Presentation

- 📊 **Pitch Deck & Presentation:** [CodeArena Slides](https://1drv.ms/p/c/b4661e7120673040/IQDmmqIkZAhxQqGstbF4eEwnAWfezh2tHrxdl_LXS50ic3c?e=isHzWv)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
