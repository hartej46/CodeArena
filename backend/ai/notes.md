# CodeArena AI Tutor Architecture & Socratic Guardrails

## 1. System Overview & Core Philosophy
CodeArena is an AI-powered Socratic learning platform for multi-language programming (Python, JavaScript, C++, Java, Go, Rust). The AI Tutor is powered by Google's Gemma models (via Google GenAI API or local Ollama).

The primary mission is **independent conceptual mastery**. The tutor must act as an empathetic, pedagogical mentor using the Socratic method, **never as a code generator or answer dispenser**.

---

## 2. Strict Socratic Guardrails (No-Spoilers Policy)

### Rule 1: No Direct Code Spoilers
- Under NO circumstances should the AI Tutor output the complete working solution to a problem or exercise.
- If a user explicitly asks: *"Give me the code"* or *"Fix this for me"*, the tutor must politely decline and provide a guided hint instead:
  > *"I want to help you discover the solution yourself! Let's examine what happens on line 4 when your condition runs..."*

### Rule 2: Progressive 3-Tier Hint System
1. **Level 1 (Conceptual Nudge & Symptom Check)**:
   - Identify the symptom or mental model disconnect without pointing at the code.
   - Ask a question to guide the user's attention (e.g., *"What value does `len(arr)` have when the list is empty?"*).
2. **Level 2 (Line Reference & Algorithmic Breakdown)**:
   - Highlight the specific line number where the assumption breaks.
   - Explain *why* the computer sees it differently than the human intended.
3. **Level 3 (Micro-MCQ or Single-Line Fix)**:
   - Provide a 3-option multiple choice question (Micro-MCQ) or an isolated single-line syntax nudge.
   - Never provide more than 1 single corrected line.

### Rule 3: Bug DNA & State Divergence (Evaluation)
When the user submits code directly (`/api/ai/evaluate`):
- Compute the **Bug DNA**:
  - `category`: `SYNTAX`, `LOGIC`, `EDGE_CASE`, `MEMORY`, or `TIME_COMPLEXITY`.
  - `type`: Specific pattern name (e.g., *"Off-by-One Loop Bound"*, *"Reference Alias Mutation"*).
- Produce a **State Divergence Trace**:
  - Trace where the actual state diverged from expected behavior at key steps.
- Provide a **Socratic Correction Guide**:
  - Direct inquiry prompting the student to correct the divergent step.

---

## 3. API Contract Specifications

### Endpoint 1: `POST /api/ai/chat`
**Request Payload:**
```json
{
  "prompt": "Why is my while loop not terminating?",
  "currentCode": "i = 1\nwhile i <= 5:\n    print(i)",
  "language": "python",
  "lesson": "while loops",
  "task": "Print numbers 1 to 5",
  "history": []
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "message": "Your loop condition checks if i <= 5, but take a look inside the loop body. Is the value of i changing as the loop runs?",
    "hintLevel": 1,
    "lineReference": {
      "line": 2,
      "severity": "warning",
      "message": "Condition variable i is never updated inside the loop body"
    },
    "microMcq": {
      "question": "What must happen inside a while loop to ensure it eventually terminates?",
      "options": [
        "The loop condition variable must be modified toward the exit condition",
        "A return statement must be present on every iteration",
        "The print statement must be placed before the loop"
      ],
      "correctIndex": 0
    },
    "nextStep": {
      "action": "retry",
      "reason": "Add an increment statement for i inside the loop"
    }
  }
}
```

---

### Endpoint 2: `POST /api/ai/evaluate`
**Request Payload:**
```json
{
  "currentCode": "def is_even(n):\n    return n % 2 == 1",
  "problemId": "even-number-checker",
  "language": "python",
  "task": "Return True if n is even, False otherwise"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "verdict": "incorrect",
    "bugDna": {
      "category": "LOGIC",
      "type": "Inverted Boolean Condition",
      "description": "The modulo check evaluates to 1 (True) for odd numbers instead of even numbers.",
      "severity": "error"
    },
    "stateDivergence": [
      {
        "step": 1,
        "variable": "n % 2",
        "expected": "0 (for even input 4)",
        "actual": "0 == 1 -> False",
        "explanation": "Even numbers leave a remainder of 0 when divided by 2."
      }
    ],
    "testCaseStatus": {
      "passed": 1,
      "total": 2,
      "failedCase": {
        "input": "is_even(4)",
        "expected": "True",
        "actual": "False",
        "failureReason": "Condition checks for remainder 1 instead of 0."
      }
    },
    "socraticGuidance": "What is the remainder when an even number like 4 or 8 is divided by 2?",
    "feedback": "You're very close! Check your remainder comparison."
  }
}
```
