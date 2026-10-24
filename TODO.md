# CodeArena — Master Implementation Guide & TODO (`TODO.md`)

This document is the complete guide and actionable checklist for CodeArena across both the **Backend** and **Frontend**. Each task includes a full explanation of what it does, why it is needed, how it works, and the exact prompt to give an AI to implement it.

---

## Part 1: Backend Implementation Tasks

### 1. Set Up Judge0 Community Edition (CE) via Docker
- [ ] **Docker Compose Setup**: Create `docker-compose.yml` to run Judge0 CE on port `2358` with PostgreSQL and Redis.
- [ ] **Service Configuration**: Generate `judge0.conf` with execution timeouts and memory limits.

* **What it is:** Judge0 is a self-hosted code execution engine that compiles and runs untrusted user code inside a secure, sandboxed container environment.
* **Why it is needed:** You cannot run user-submitted code directly on your main server because malicious or faulty code could run infinite loops or delete files. Judge0 handles the process isolation, memory limits, and timeouts.
* **How it works:** Spins up 4 coordinated containers: PostgreSQL (stores logs and language configs), Redis (acts as the job queue), the Judge0 API server, and background worker containers that execute the code.
* **How to prompt an AI:**
  > *"Create a standard Docker Compose file to run Judge0 Community Edition locally. Configure Redis, Postgres, the Judge0 server, and the Judge0 worker on port 2358 so my backend can submit code to it."*

---

### 2. Implement the Judge0 Service (`backend/src/services/judge0Service.js`)
- [ ] **Language Mapping**: Map language strings (e.g., `'python'`, `'cpp'`) to Judge0 numeric IDs (Python: `71`, C++: `54`, JavaScript: `63`, Java: `62`).
- [ ] **Synchronous Submission**: Send HTTP POST requests to `http://localhost:2358/submissions?base64_encoded=false&wait=true`.
- [ ] **Response Parser**: Standardize Judge0 status codes (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Compilation Error`) into a clean format.

* **What it is:** A dedicated service module in Node.js that bridges your Express server with the Judge0 container.
* **Why it is needed:** Keeps your Express route handlers clean and abstracts away low-level Judge0 API parameters.
* **How it works:** Accepts code and language from Express, translates the language name into Judge0's numeric ID, posts it to Judge0 with `?wait=true` to wait for completion, and extracts `stdout`, `stderr`, execution time, and memory.
* **How to prompt an AI:**
  > *"Write a Node.js service that sends code, language ID, and optional test input to Judge0's `/submissions?wait=true` endpoint. Map language names to Judge0 IDs, handle errors, and return a clean object containing status, stdout, stderr, execution time in milliseconds, and memory used."*

---

### 3. Expose Execution Routes in `backend/index.js`
- [ ] **Run Route (`POST /api/run`)**: Accept `{ language, code, stdin }` and return test execution output.
- [ ] **Submit Route (`POST /api/submit`)**: Evaluate code against hidden test cases and return a final pass/fail verdict.

* **What it is:** Express API endpoints that the React frontend calls when the student clicks "Run Code" or "Submit Code".
* **Why it is needed:** Provides the client with a secure REST interface to run their code without exposing internal server infrastructure.
* **How it works:** Express receives the HTTP request body, validates that code and language are present, invokes `judge0Service.js`, and sends back the standardized execution metrics as JSON.
* **How to prompt an AI:**
  > *"In my Express `index.js`, create a `POST /api/run` endpoint that accepts code, language, and stdin in the request body, calls my Judge0 service, and returns the execution results to the client."*

---

## Part 2: Frontend Implementation Tasks

### 1. In-Browser Execution Sandbox (Web Worker + Pyodide)
- [ ] **Worker Creation**: Add `src/workers/pythonWorker.js` to execute Python locally via Pyodide in WebAssembly.
- [ ] **Output Capture**: Listen to worker messages and capture batched `stdout` and `stderr` streams.
- [ ] **Watchdog Timer**: Terminate the worker after 3000ms if client code hangs in an infinite loop.

* **What it is:** Running a lightweight compiler directly inside the browser using WebAssembly.
* **Why it is needed:** Instant (0ms) feedback for quick student tests without putting load on your backend servers or incurring hosting costs.
* **How it works:** Runs on a background browser thread (Web Worker) so long-running user code never freezes the React user interface. If execution exceeds 3 seconds, `worker.terminate()` is called.
* **How to prompt an AI:**
  > *"Create a Web Worker in React using Pyodide to run Python code client-side. Set up listeners to capture printed output and add a 3-second watchdog timer to terminate the worker if the code runs into an infinite loop."*

---

### 2. Live Terminal Integration (Replacing Fake Data)
- [ ] **Real API Hookup**: In `src/tutor/AITutor.jsx`, replace lines 545–558 (static mock response) with live API calls to `/api/run`.
- [ ] **Metric Badges**: Display live execution time (`ms`), memory (`MB`), and status badge (`Accepted`, `Runtime Error`).
- [ ] **Test Case View**: Implement tabbed input views (Sample Tests vs. Custom User Input).

* **What it is:** Updating the terminal drawer in the editor UI to show real compiler results instead of mock strings.
* **Why it is needed:** Students must see real errors, syntax mistakes, and runtime metrics to debug their algorithms.
* **How it works:** When "Submit Code" is pressed, the frontend triggers an Axios POST call to `/api/run`. The received `stdout`, `stderr`, and runtime stats are stored in React state and rendered in the terminal console component.
* **How to prompt an AI:**
  > *"In `AITutor.jsx`, replace the mock response in the code submission handler with an actual Axios POST request to `/api/run`. Render the real stdout, stderr, runtime in milliseconds, and status badge in the terminal."*

---

### 3. Prompt Guard UI Feedback
- [ ] **Pre-Flight Validation**: Add client-side validation on prompt submission in `handleSendPrompt`.
- [ ] **Warning Banner**: Display an inline warning if prompt text is gibberish, too short, or off-topic.

* **What it is:** A client-side heuristic check on the student's question before it is sent to the AI tutor.
* **Why it is needed:** Catches random keyboard mashing (e.g., `"asdfghjkl"`) or off-topic prompts instantly without making an unnecessary network request.
* **How it works:** Performs a quick length, entropy, and keyword check. If invalid, the submission is blocked and a friendly guidance banner is shown directly under the input field.
* **How to prompt an AI:**
  > *"Add a client-side validation check to the prompt input field in `AITutor.jsx`. If the input is gibberish, too short, or unrelated to programming, display a friendly warning banner and prevent sending the request."*

---

### 4. AI Tutor Interactivity (Progressive Hints & One-Click Fixes)
- [ ] **Progressive Hint Accordions**: Render hints step-by-step (Hint 1 $\rightarrow$ Hint 2 $\rightarrow$ Solution) instead of spoiling answers.
- [ ] **One-Click Code Fixer**: Add an "Apply Fix" button on suggested code snippets to update the active editor buffer with one click.
- [ ] **Edge Case Drawer**: Show automated test case suggestions generated by the tutor.

* **What it is:** Turning passive text explanations into interactive code coaching.
* **Why it is needed:** Students learn better when nudged progressively, and one-click code application improves the interactive editing experience.
* **How it works:** The AI response returns structured metadata. The frontend renders progressive collapsible panels for hints and binds a click handler to replace the active Monaco/CodeMirror code state with the AI's proposed solution.
* **How to prompt an AI:**
  > *"Update the AI Tutor chat component to render progressive hints in collapsible accordions, and if the AI response includes a code fix block, render an 'Apply Fix' button that updates the editor's active code state."*
