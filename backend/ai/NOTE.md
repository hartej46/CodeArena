# AI Module Integration Guide for Backend (`NOTE.md`)

This document is the official API specification for the `ai/` module inside `backend/`. It documents **only the public functions that the backend Express server will import and use**. Internal engine helpers (such as prompt builders, model callers, and raw parsers) are encapsulated inside `ai/` and must not be imported directly.

---

## 1. Quick Integration Overview

The AI engine is exported as a standalone Node.js CommonJS module from [`backend/ai/index.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/index.js).

### Importing in Backend
In your Express route files (e.g., [`backend/index.js`](file:///Users/hartej/Hartej46/CodeArena/backend/index.js) or a dedicated router):

```javascript
const ai = require('./ai'); // or require('./ai/index')

// Route 1: Tutor Chat
router.post('/ai/chat', async (req, res) => {
  const result = await ai.chat(req.body);
  res.json({ reply: result });
});

// Route 2: Inline Code Review
router.post('/ai/review', async (req, res) => {
  const result = await ai.reviewCode(req.body);
  res.json(result);
});
```

---

## 2. Public Functions Reference

| Function | Source Service | Purpose |
| :--- | :--- | :--- |
| [`ai.chat(input)`](#1-aichatinput) | [`services/chatService.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/services/chatService.js) | Handles interactive student-tutor dialogue with progressive hints and structured UI actions (fixes, issues, next steps). |
| [`ai.reviewCode(input)`](#2-aireviewcodeinput) | [`services/reviewService.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/services/reviewService.js) | Evaluates code against a task, providing inline line-by-line diagnostics and a pass/fail verdict. |

---

## 3. Function Details & Payload Contracts

### 1. `ai.chat(input)`

#### Purpose & Motivation
The chat feature acts as a private, real-time programming tutor. Instead of simply generating answers, it:
1. Explains concepts in accessible terms.
2. Gives progressive hints and guiding questions before revealing solutions.
3. Provides structured UI metadata (`fix`, `issue`, `example`, `next_step`) that the frontend code editor can highlight or apply directly with one click.

#### Input Parameters (`Object`)
Pass the HTTP request body `req.body` directly:

```json
{
  "language": "python",
  "lesson": "while loop",
  "task": "Print numbers 1 to 5 using a while loop",
  "code": "i = 1\nwhile i < 3:\n    print(i)\n    i += 1",
  "lastOutput": "1\n2",
  "message": "Why does my loop stop before reaching 5?",
  "history": [
    { "role": "user", "content": "How do I start a while loop?" },
    { "role": "assistant", "content": "You initialize a counter variable first." }
  ]
}
```

* **`language`** *(string, optional, default: `'Python'`)*: Target language (`'python'`, `'javascript'`, `'c'`, `'java'`).
* **`lesson`** *(string, optional, default: `'General'`)*: Name of the current lesson module.
* **`task`** *(string, optional, default: `''`)*: Description of what the student is asked to solve.
* **`code`** *(string, optional, default: `''`)*: Code currently present in the student's editor.
* **`lastOutput`** *(string, optional, default: `''`)*: Terminal stdout, stderr, or execution output.
* **`message`** *(string, required)*: The student's text prompt or question.
* **`history`** *(array, optional, default: `[]`)*: Array of `{ role: 'user' | 'assistant', content: string }`. Only the latest ~6 messages are sent to the model to keep latency low.

#### Output Response (`Object`)
`ai.chat` **always returns a structured JSON object** with 5 guaranteed keys (keys not needed for a reply are set to `{}`):

```json
{
  "message": "Your loop condition stops when i is no longer less than 3. To print numbers up to 5, you need to check up to 5.",
  "fix": {
    "start_line": 2,
    "end_line": 2,
    "original": "while i < 3:",
    "replacement": "while i <= 5:",
    "explanation": "Allows the loop to continue until i reaches 5."
  },
  "issue": {
    "line": 2,
    "severity": "warning",
    "message": "Loop terminates prematurely at 3 instead of 5."
  },
  "example": {},
  "next_step": {
    "action": "run_code",
    "reason": "Test the updated condition to verify it outputs 1 through 5."
  }
}
```

#### Meaning of Output Keys for the Frontend:
* **`message`** *(string)*: Text shown in the chat bubble.
* **`fix`** *(object or `{}`)*: If present, specifies exact line range (`start_line`, `end_line`), `original` code, and `replacement` code so the frontend can offer an "Apply Fix" button.
* **`issue`** *(object or `{}`)*: Highlights a single problem line in the Monaco/Ace editor with severity (`'error'`, `'warning'`, `'tip'`).
* **`example`** *(object or `{}`)*: An educational snippet (`language`, `code`, `explanation`) that demonstrates a concept without solving the student's task directly.
* **`next_step`** *(object or `{}`)*: Recommended user action (`action`: `'run_code'` | `'retry'` | `'go_next_section'`).

---

### 2. `ai.reviewCode(input)`

#### Purpose & Motivation
Triggered when the student clicks "Submit" or "Check Code". It validates logic, syntax, edge cases, and style without running arbitrary code on the server, producing actionable diagnostics mapped to editor line numbers.

#### Input Parameters (`Object`)
Pass `req.body` directly:

```json
{
  "language": "python",
  "task": "Print numbers from 1 to 5 using a while loop",
  "code": "i = 1\nwhile i <= 5\n    print(i)\n    i += 1",
  "lastOutput": "SyntaxError: expected ':'"
}
```

* **`language`** *(string, optional, default: `'Python'`)*: Target language.
* **`task`** *(string, optional, default: `''`)*: Goal of the exercise.
* **`code`** *(string, required)*: The student's code submission.
* **`lastOutput`** *(string, optional, default: `''`)*: Runtime error or stdout from the code execution runner.

#### Output Response (`Object`)
`ai.reviewCode` **always returns a normalized object** matching this exact schema:

##### Case A: Code has issues (`verdict: "incorrect"`)
```json
{
  "verdict": "incorrect",
  "issues": [
    {
      "line": 2,
      "severity": "error",
      "message": "Missing colon (:) at the end of the while loop statement.",
      "suggestion": "Add a colon: while i <= 5:"
    }
  ],
  "feedback": "You have the right counting logic! Just make sure to add the colon at the end of line 2 so Python recognizes the loop block."
}
```

##### Case B: Code is correct (`verdict: "correct"`)
```json
{
  "verdict": "correct",
  "issues": [],
  "feedback": "Great job! Your while loop properly counts from 1 to 5 and terminates as expected."
}
```

#### Meaning of Output Keys for the Frontend:
* **`verdict`** *(string)*: Either `"correct"` or `"incorrect"`. The frontend uses this to mark the section complete or keep it in progress.
* **`issues`** *(array)*:
  * Empty array `[]` when code is correct.
  * When incorrect, each issue provides `line` (1-based line number for Monaco editor markers), `severity` (`'error'` | `'warning'` | `'tip'`), `message`, and `suggestion`.
* **`feedback`** *(string)*: Exactly 2 constructive, friendly sentences designed to be shown in the chat or review summary panel.

---

## 4. Error Handling & Safety Guarantees

1. **Zero Express Crashes**: Both functions wrap model calls, network fetches, and JSON parsing in `try/catch` blocks. **They will never throw unhandled rejections to your route handlers.**
2. **Deterministic Fallbacks**: If the AI model times out, network fails, or configuration is missing:
   * `ai.chat()` returns the safe fallback object:
     ```json
     {
       "message": "I'm having a little trouble connecting right now. Please try asking again in a moment!",
       "fix": {},
       "issue": {},
       "example": {},
       "next_step": {}
     }
     ```
   * `ai.reviewCode()` returns the safe fallback object:
     ```json
     {
       "verdict": "incorrect",
       "issues": [],
       "feedback": "Unable to complete code review at this time. Please check your setup and try again."
     }
     ```
3. **No Database or Auth Dependencies**: The `ai/` folder is stateless. All state persistence (saving chat history, student progress, user profiles) belongs to the Express backend controllers.

---

## 5. Environment Requirements

The AI module reads its configuration via [`backend/ai/config.js`](file:///Users/hartej/Hartej46/CodeArena/backend/ai/config.js). The backend must ensure `backend/.env` has:

```env
# Choose: 'google' or 'ollama'
AI_PROVIDER=ollama

# If using Google Gemini / Gemma API:
GOOGLE_API_KEY=your_key_here
GOOGLE_MODEL=gemini-2.5-flash

# If using local Ollama:
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
```
