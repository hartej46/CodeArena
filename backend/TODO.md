# Backend Implementation Guide & TODO (`backend/TODO.md`)

This document outlines the backend tasks for CodeArena, including explanations and prompts to instruct an AI.

---

## 1. Set Up Judge0 Community Edition (CE) via Docker
- [ ] **Docker Compose Setup**: Create `docker-compose.yml` to run Judge0 CE on port `2358` with PostgreSQL and Redis.
- [ ] **Service Configuration**: Generate `judge0.conf` with execution timeouts and memory limits.

* **What it is:** Judge0 is a self-hosted code execution engine that compiles and runs untrusted code inside a sandboxed container.
* **Why it is needed:** Untrusted code cannot run directly on your main server. Judge0 provides process isolation, memory caps, and watchdog timeouts.
* **How it works:** Uses 4 coordinated containers: PostgreSQL (stores logs and language configs), Redis (job queue), Judge0 API server, and worker containers that execute the code.
* **How to prompt an AI:**
  > *"Create a standard Docker Compose file to run Judge0 Community Edition locally. Configure Redis, Postgres, the Judge0 server, and the Judge0 worker on port 2358 so my backend can submit code to it."*

---

## 2. Implement the Judge0 Service (`src/services/judge0Service.js`)
- [ ] **Language Mapping**: Map language names to Judge0 numeric IDs (Python: `71`, C++: `54`, JavaScript: `63`, Java: `62`).
- [ ] **Synchronous Submission**: Send HTTP POST to `http://localhost:2358/submissions?base64_encoded=false&wait=true`.
- [ ] **Response Parser**: Standardize Judge0 status codes (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Compilation Error`).

* **What it is:** A Node.js module that bridges your Express server with the Judge0 container.
* **Why it is needed:** Encapsulates Judge0 API logic away from Express route handlers.
* **How it works:** Accepts code, converts language to numeric ID, sends an HTTP request to Judge0 with `?wait=true`, and returns a clean object with `stdout`, `stderr`, runtime, and memory.
* **How to prompt an AI:**
  > *"Write a Node.js service that sends code, language ID, and optional test input to Judge0's `/submissions?wait=true` endpoint. Map language names to Judge0 IDs, handle errors, and return a clean object containing status, stdout, stderr, execution time in milliseconds, and memory used."*

---

## 3. Expose Execution Routes in `backend/index.js`
- [ ] **Run Route (`POST /api/run`)**: Accept `{ language, code, stdin }` and return test execution output.
- [ ] **Submit Route (`POST /api/submit`)**: Evaluate code against hidden test cases and return a final pass/fail verdict.

* **What it is:** Express API endpoints that the React frontend calls when the student clicks "Run Code" or "Submit Code".
* **Why it is needed:** Provides the client with a secure REST interface to run their code without exposing internal server infrastructure.
* **How it works:** Validates request payload, calls `judge0Service.js`, and returns standardized execution metrics as JSON.
* **How to prompt an AI:**
  > *"In my Express `index.js`, create a `POST /api/run` endpoint that accepts code, language, and stdin in the request body, calls my Judge0 service, and returns the execution results to the client."*

---

## 4. Open-Source Jev Decision Engine on Ollama (COMPLETED)
- [x] **Jev Engine Implemented**: Created [`backend/ai/services/jevEngine.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/services/jevEngine.js) implementing:
  - `jev.choice()`: Structured categorical classification.
  - `jev.noul()`: Binary True/False decision with calibrated confidence.
  - `jev.score()`: Calibrated rubric scoring.
  - `jev.validatePrompt()`: Instant non-chatty coding guardrail catching off-topic/bad prompts.
- [x] **Verified via Live Tests**: Tested with [`backend/ai/testJev.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/testJev.js) running locally on Ollama.
