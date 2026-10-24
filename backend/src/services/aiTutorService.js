// backend/src/services/aiTutorService.js
// AI Tutor Service implementing Socratic Guardrails & Gemma LLM integration

const { callModel } = require('../../ai/provider');
const parseJson = require('../../ai/utils/parseJson');

function numberLines(code) {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return '(empty editor)';
  }
  return code
    .split('\n')
    .map((line, idx) => `${idx + 1}: ${line}`)
    .join('\n');
}

/**
 * Extracts and synthesizes the last 2-3 core conversation turns into structured memory
 */
function extractCoreConversationMemory(history, currentPrompt = '') {
  if (!Array.isArray(history) || history.length === 0) {
    return '(No previous conversation context. This is the start of the session.)';
  }

  // Filter out any trailing duplicate message matching current prompt
  const cleanPrompt = String(currentPrompt || '').trim().toLowerCase();
  const filtered = history.filter((m, idx) => {
    if (!m || typeof m.content !== 'string') return false;
    const isLast = idx === history.length - 1;
    if (isLast && m.role === 'user' && m.content.trim().toLowerCase() === cleanPrompt) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return '(No previous conversation context. This is the start of the session.)';
  }

  // Slice last 6 messages to get the last 2-3 complete prompt-response pairs
  const recentSlice = filtered.slice(-6);
  const memoryLines = [];
  let turnNumber = 1;

  for (let i = 0; i < recentSlice.length; i++) {
    const msg = recentSlice[i];
    if (msg.role === 'user') {
      const nextMsg = recentSlice[i + 1];
      const assistantText = nextMsg && nextMsg.role === 'assistant' ? nextMsg.content : '';
      const userText = msg.content.length > 180 ? `${msg.content.slice(0, 180)}...` : msg.content;
      const botText = assistantText ? (assistantText.length > 180 ? `${assistantText.slice(0, 180)}...` : assistantText) : '(no response recorded)';

      memoryLines.push(
        `- Turn ${turnNumber}: Student asked: "${userText}"\n  Tutor answered: "${botText}"`
      );
      turnNumber++;
      if (assistantText) i++; // Skip paired assistant turn
    }
  }

  return memoryLines.length > 0
    ? memoryLines.join('\n')
    : '(No previous substantive user prompts.)';
}

/**
 * Builds the Socratic Chat system prompt with conversation memory
 */
function buildSocraticChatPrompt({ language, lesson, task, currentCode, hintLevel = 1, memoryContext = '' }) {
  const numbered = numberLines(currentCode);

  return `You are the Socratic AI Tutor on "CodeArena", a multi-language programming mastery platform.
Your learner is coding in ${language || 'Python'}.
Lesson / Topic: ${lesson || 'General Programming'}
Task: ${task || 'Solve the problem and master the concept'}

Student's Current Editor Code (with 1-based line numbers for reference):
--- CODE START ---
${numbered}
--- CODE END ---

## CONVERSATION MEMORY (Context from Previous 2-3 Core Prompts):
${memoryContext}

## SOCRATIC TEACHING GUARDRAILS & MEMORY RETENTION:
1. **CONVERSATION CONTINUITY (MANDATORY)**:
   - You have access to the student's previous 2-3 prompts above in CONVERSATION MEMORY.
   - Build directly upon the concepts, bugs, or questions discussed in those previous turns.
   - If the student refers back to an earlier question (e.g., "why didn't that work?", "can you explain that again?", "what should I do next?"), understand what they mean from memory without asking them to re-explain.
   - Do NOT repeat questions or explanations you already gave in previous turns.
2. **NO SPOILERS / NO DIRECT CODE SOLUTIONS**:
   - NEVER write the complete working program or function for the student.
   - If the student directly asks "give me the code" or "just write it for me", politely decline: "I'm here to help you solve it yourself! Let's break down where the logic is hanging up."
3. **SOCRATIC METHOD ONLY**:
   - Ask guiding questions that lead the learner to observe their own misconceptions.
   - Target the conceptual bug or symptom (e.g., "What value does 'i' have when the condition is checked for the third time?").
4. **PROGRESSIVE HINTING (Current hint level: ${hintLevel})**:
   - Level 1 (Nudge): Ask a question regarding the symptom or mental model.
   - Level 2 (Line Reference): Point to the specific line number where the assumption breaks and explain why.
   - Level 3 (Micro-MCQ): Offer a quick 3-option multiple-choice question to solidify the concept.
5. **LENGTH**: Keep your "message" friendly, supportive, and under 120 words.

## OUTPUT FORMAT (STRICT):
You must reply with ONLY a single, valid JSON object. No Markdown code fences, no surrounding chatter.
The response must adhere to this exact schema:

{
  "message": "string (friendly Socratic inquiry or explanation)",
  "hintLevel": ${hintLevel},
  "lineReference": {
    "line": 1,
    "severity": "warning",
    "message": "Short description of what to examine on this line"
  },
  "microMcq": {
    "question": "Quick question testing the core misconception",
    "options": ["Option A", "Option B", "Option C"],
    "correctIndex": 0
  },
  "fix": {},
  "nextStep": {
    "action": "run_code" | "retry" | "go_next_section",
    "reason": "short explanation of what to test next"
  }
}

Note: If a field like "lineReference", "microMcq", or "fix" is not applicable, set it to null or {} (empty object). Never omit required keys.`;
}

/**
 * Builds the Code Evaluation prompt (Bug DNA & State Divergence)
 */
function buildEvaluationPrompt({ language, task, currentCode, problemId, lastOutput }) {
  const numbered = numberLines(currentCode);

  return `You are the CodeArena Automated Code Evaluator & Bug DNA Diagnostics Engine.
Analyze the student's submitted code for correctness, syntax errors, edge cases, and algorithmic bugs.

Language: ${language || 'Python'}
Problem ID: ${problemId || 'general-task'}
Task Description: ${task || 'Complete the solution according to specifications'}

Submitted Code (with 1-based line numbers):
--- CODE START ---
${numbered}
--- CODE END ---

Execution Output / Error (if any):
${lastOutput || '(none)'}

## EVALUATION OBJECTIVES:
1. Determine if the code correctly solves the task without syntax or logical bugs.
2. If incorrect, compute the **Bug DNA**:
   - "category": Must be one of ["SYNTAX", "LOGIC", "EDGE_CASE", "MEMORY", "TIME_COMPLEXITY"]
   - "type": Specific bug pattern name (e.g., "Off-by-One Loop Bound", "Inverted Boolean Condition", "NullPointer Reference")
   - "description": Plain-English explanation of why this bug pattern occurs.
   - "severity": "error" | "warning" | "critical"
3. Generate a **State Divergence Trace**:
   - Show 1 to 3 steps where the program state diverged from expected values (e.g. variable x expected 5 but became 4).
4. Provide **Socratic Guidance**:
   - A single guiding inquiry prompting the student to correct the divergent step WITHOUT giving away the full solution code.
5. Provide **Feedback**: Exactly two constructive, encouraging sentences suitable for the learning chat.

## OUTPUT FORMAT (STRICT):
Respond with ONLY a single, valid JSON object. No markdown fences.

{
  "verdict": "correct" or "incorrect",
  "bugDna": {
    "category": "LOGIC",
    "type": "Off-by-One Loop Bound",
    "description": "Loop terminates prematurely before visiting the final element.",
    "severity": "error"
  },
  "stateDivergence": [
    {
      "step": 1,
      "variable": "i",
      "expected": 5,
      "actual": 4,
      "explanation": "Loop condition '< 5' stopped execution before reaching 5."
    }
  ],
  "testCaseStatus": {
    "passed": 2,
    "total": 3,
    "failedCase": {
      "input": "n = 5",
      "expected": "15",
      "actual": "10",
      "failureReason": "Last number omitted from sum accumulation"
    }
  },
  "socraticGuidance": "When your loop reaches its final turn, what is the value of 'i' and why did it exit early?",
  "feedback": "You're very close! Check your loop's upper bound to capture the final number."
}

If the code is fully correct:
- set "verdict" to "correct"
- set "bugDna" to null
- set "stateDivergence" to []
- set "testCaseStatus" to { "passed": 3, "total": 3, "failedCase": null }
- set "socraticGuidance" to "Excellent work! Your solution passes all test cases."
- set "feedback": "Great job! Your logic is solid and handles all requirements cleanly."`;
}

/**
 * Normalizes and sanitizes chat response
 */
function sanitizeChatOutput(parsed, rawReply) {
  if (parsed && typeof parsed === 'object') {
    return {
      message:
        typeof parsed.message === 'string' && parsed.message.trim()
          ? parsed.message.trim()
          : typeof rawReply === 'string' && rawReply.trim()
          ? rawReply.trim()
          : "Let's review this step together. What do you expect your code to output at this point?",
      hintLevel: typeof parsed.hintLevel === 'number' ? parsed.hintLevel : 1,
      lineReference:
        parsed.lineReference && typeof parsed.lineReference === 'object' && parsed.lineReference.line
          ? {
              line: Number(parsed.lineReference.line),
              severity: parsed.lineReference.severity || 'warning',
              message: String(parsed.lineReference.message || ''),
            }
          : null,
      microMcq:
        parsed.microMcq && Array.isArray(parsed.microMcq.options) && parsed.microMcq.question
          ? {
              question: String(parsed.microMcq.question),
              options: parsed.microMcq.options.map(String),
              correctIndex: Number(parsed.microMcq.correctIndex || 0),
            }
          : null,
      fix: parsed.fix && typeof parsed.fix === 'object' && Object.keys(parsed.fix).length > 0 ? parsed.fix : null,
      nextStep:
        parsed.nextStep && typeof parsed.nextStep === 'object'
          ? {
              action: parsed.nextStep.action || 'retry',
              reason: parsed.nextStep.reason || 'Test your updated logic',
            }
          : { action: 'retry', reason: 'Review the hint and test again' },
    };
  }

  // Graceful fallback
  return {
    message:
      typeof rawReply === 'string' && rawReply.trim()
        ? rawReply.trim()
        : "I'm looking at your code. What do you expect to happen on the line where execution pauses?",
    hintLevel: 1,
    lineReference: null,
    microMcq: null,
    fix: null,
    nextStep: { action: 'retry', reason: 'Trace your variables step by step' },
  };
}

/**
 * Normalizes and sanitizes evaluation output
 */
function sanitizeEvaluationOutput(parsed) {
  if (parsed && typeof parsed === 'object') {
    const verdict = String(parsed.verdict || '').toLowerCase() === 'correct' ? 'correct' : 'incorrect';

    return {
      verdict,
      bugDna:
        verdict === 'correct'
          ? null
          : parsed.bugDna && typeof parsed.bugDna === 'object'
          ? {
              category: parsed.bugDna.category || 'LOGIC',
              type: parsed.bugDna.type || 'Logic Inconsistency',
              description: parsed.bugDna.description || 'Unexpected behavior detected during execution.',
              severity: parsed.bugDna.severity || 'error',
            }
          : {
              category: 'LOGIC',
              type: 'Runtime Discrepancy',
              description: 'The code produced an unexpected output.',
              severity: 'error',
            },
      stateDivergence: Array.isArray(parsed.stateDivergence)
        ? parsed.stateDivergence.map((sd, idx) => ({
            step: Number(sd.step || idx + 1),
            variable: String(sd.variable || 'state'),
            expected: String(sd.expected ?? ''),
            actual: String(sd.actual ?? ''),
            explanation: String(sd.explanation || ''),
          }))
        : [],
      testCaseStatus: parsed.testCaseStatus && typeof parsed.testCaseStatus === 'object'
        ? {
            passed: Number(parsed.testCaseStatus.passed ?? (verdict === 'correct' ? 3 : 1)),
            total: Number(parsed.testCaseStatus.total ?? 3),
            failedCase: parsed.testCaseStatus.failedCase || null,
          }
        : {
            passed: verdict === 'correct' ? 3 : 1,
            total: 3,
            failedCase: null,
          },
      socraticGuidance:
        typeof parsed.socraticGuidance === 'string' && parsed.socraticGuidance.trim()
          ? parsed.socraticGuidance.trim()
          : verdict === 'correct'
          ? 'Great job solving this challenge!'
          : 'Trace through the first failed case step-by-step: what does the state hold before the loop exits?',
      feedback:
        typeof parsed.feedback === 'string' && parsed.feedback.trim()
          ? parsed.feedback.trim()
          : verdict === 'correct'
          ? 'Solution verified! Your implementation passes all requirements cleanly.'
          : 'Check your conditional boundaries and variable updates before submitting again.',
    };
  }

  // Fallback
  return {
    verdict: 'incorrect',
    bugDna: {
      category: 'LOGIC',
      type: 'Execution Diagnostic',
      description: 'The evaluator encountered an issue parsing the execution model.',
      severity: 'warning',
    },
    stateDivergence: [],
    testCaseStatus: { passed: 0, total: 1, failedCase: null },
    socraticGuidance: 'Please review your syntax and logic boundaries.',
    feedback: 'Evaluation completed with warnings. Please try testing your code locally or reviewing recent changes.',
  };
}

/**
 * Handle POST /api/ai/chat with conversation memory
 */
async function handleChat({ prompt, currentCode, language = 'Python', lesson = 'Coding', task = '', history = [], hintLevel = 1 }) {
  const currentPrompt = prompt || 'Please review my current code and provide a hint.';
  const memoryContext = extractCoreConversationMemory(history, currentPrompt);

  const systemPrompt = buildSocraticChatPrompt({
    language,
    lesson,
    task,
    currentCode,
    hintLevel,
    memoryContext,
  });

  // Filter out any trailing message identical to currentPrompt
  const cleanPrompt = currentPrompt.trim().toLowerCase();
  const cleanHistory = Array.isArray(history)
    ? history.filter((m, idx) => {
        if (!m || typeof m.content !== 'string') return false;
        const isLast = idx === history.length - 1;
        if (isLast && m.role === 'user' && m.content.trim().toLowerCase() === cleanPrompt) {
          return false;
        }
        return true;
      })
    : [];

  const recentHistory = cleanHistory.slice(-6).map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: typeof msg.content === 'string' ? msg.content : '',
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: currentPrompt },
  ];

  let rawReply = '';
  try {
    rawReply = await callModel(messages, { temperature: 0.2 });
    const parsed = parseJson(rawReply);
    return sanitizeChatOutput(parsed, rawReply);
  } catch (err) {
    console.warn('aiTutorService.handleChat model warning:', err.message);
    return sanitizeChatOutput(null, rawReply);
  }
}

/**
 * Handle POST /api/ai/evaluate
 */
async function handleEvaluate({ currentCode, problemId = '', language = 'Python', task = '', lastOutput = '' }) {
  const systemPrompt = buildEvaluationPrompt({
    language,
    task,
    currentCode,
    problemId,
    lastOutput,
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Evaluate this code and return Bug DNA, State Divergence, and test cases in the specified JSON schema.' },
  ];

  let rawReply = '';
  try {
    rawReply = await callModel(messages, { temperature: 0.1 });
    const parsed = parseJson(rawReply);
    return sanitizeEvaluationOutput(parsed);
  } catch (err) {
    console.warn('aiTutorService.handleEvaluate model warning:', err.message);
    return sanitizeEvaluationOutput(null);
  }
}

module.exports = {
  handleChat,
  handleEvaluate,
  buildSocraticChatPrompt,
  buildEvaluationPrompt,
};