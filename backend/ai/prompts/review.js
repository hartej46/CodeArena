// Exports the prompt generator function for inline code review.

function numberLines(code) {
  if (!code || typeof code !== 'string') return '1: (empty)';
  return code
    .split('\n')
    .map((line, idx) => `${idx + 1}: ${line}`)
    .join('\n');
}

function getReviewPrompt({ language = 'programming', task = '', code = '', lastOutput = '' } = {}) {
  const numberedCode = numberLines(code);

  return `You are an automated code review engine for an adaptive programming learning platform.
Review the student's code for the given task.

Task:
${task || 'Complete the exercise'}

Language:
${language}

Student's Code (with 1-based line numbers for reference):
${numberedCode}

Execution Output / Error (if any):
${lastOutput ? lastOutput : '(none)'}

Review Rules:
1. Focus on code correctness, syntax, runtime errors, and logic bugs according to the task.
2. If the code has syntax errors, runtime failures, infinite loops, or incorrect logic, set "verdict" to "incorrect".
   For each problem, include an item in "issues" with:
   - "line": The 1-based line number (integer) from the numbered code above where the problem occurs.
   - "severity": Must be exactly one of "error", "warning", or "tip".
   - "message": A clear explanation of the issue on that line.
   - "suggestion": A concrete, actionable fix.
3. If the code correctly fulfills the task and runs without errors, set "verdict" to "correct" and "issues" to [].
4. "feedback" MUST be exactly 2 friendly, constructive sentences suitable for displaying in the chat panel.
5. Respond with ONLY valid JSON. No conversational intro, no explanations outside the JSON, and no markdown fences.

Expected JSON format:
{
  "verdict": "correct" or "incorrect",
  "issues": [
    {
      "line": 1,
      "severity": "error",
      "message": "problem explanation",
      "suggestion": "how to fix it"
    }
  ],
  "feedback": "Two friendly sentences."
}`;
}

module.exports = getReviewPrompt;
