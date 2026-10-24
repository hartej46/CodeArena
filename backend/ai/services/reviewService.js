// Handles code review requests, structured output validation, and fallback handling.
const { callModel } = require('../provider');
const getReviewPrompt = require('../prompts/review');
const parseJson = require('../utils/parseJson');
const jev = require('./jevEngine');

const FALLBACK_REVIEW = {
  verdict: 'incorrect',
  issues: [],
  feedback: 'Unable to complete code review at this time. Please check your setup and try again.',
  accuracy: 0.5,
  confidence: 0.5,
  refined: false,
};

function validateAndSanitize(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const rawVerdict = String(parsed.verdict || '').toLowerCase().trim();
  if (rawVerdict !== 'correct' && rawVerdict !== 'incorrect') {
    return null;
  }

  if (!Array.isArray(parsed.issues)) {
    return null;
  }

  const validIssues = [];
  for (const item of parsed.issues) {
    if (!item || typeof item !== 'object') return null;

    const line = parseInt(item.line, 10);
    if (isNaN(line) || line < 1) return null;

    const severity = String(item.severity || '').toLowerCase().trim();
    if (!['error', 'warning', 'tip'].includes(severity)) return null;

    if (typeof item.message !== 'string') return null;
    if (typeof item.suggestion !== 'string') return null;

    validIssues.push({
      line,
      severity,
      message: item.message,
      suggestion: item.suggestion,
    });
  }

  const feedback =
    typeof parsed.feedback === 'string' && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : rawVerdict === 'correct'
      ? 'Great job! Your code is working as expected.'
      : 'There are a few issues to fix in your code.';

  return {
    verdict: rawVerdict,
    issues: rawVerdict === 'correct' ? [] : validIssues,
    feedback,
  };
}

async function reviewCode(input = {}) {
  let rawOutput = '';
  try {
    const { language = 'Python', task = '', code = '', lastOutput = '' } = input;
    const basePrompt = getReviewPrompt({ language, task, code, lastOutput });
    let currentPrompt = basePrompt;
    let attempts = 0;
    const MAX_RETRIES = 2; // Up to 2 automated refinements if accuracy < 0.75
    let finalSanitized = null;
    let finalAccuracy = 0.8;
    let wasRefined = false;

    while (attempts <= MAX_RETRIES) {
      attempts++;
      const messages = [{ role: 'user', content: currentPrompt }];

      // Use low temperature (0.1) for JSON outputs
      rawOutput = await callModel(messages, { temperature: 0.1 });

      const parsed = parseJson(rawOutput);
      const sanitized = validateAndSanitize(parsed);

      if (!sanitized) {
        console.error(`[reviewService] Invalid JSON shape on attempt ${attempts}.`);
        if (attempts > MAX_RETRIES) return FALLBACK_REVIEW;
        // Inject format correction prompt
        currentPrompt = `${basePrompt}\n\n[REFINEMENT CRITIQUE]: The previous response failed JSON parsing. Return ONLY valid JSON with keys "verdict", "issues", and "feedback".`;
        continue;
      }

      // Step 2: Use Jev decision engine to calculate accuracy probability
      const evalResult = await jev.evaluateReviewAccuracy(task, code, lastOutput, sanitized);
      finalAccuracy = evalResult.accuracy;

      console.log(`[Jev Accuracy Check] Attempt ${attempts}: Accuracy Probability = ${(finalAccuracy * 100).toFixed(1)}% (Threshold: 75%)`);

      // If accuracy meets threshold (>= 0.75) or max retries reached, accept it
      if (finalAccuracy >= 0.75 || attempts > MAX_RETRIES) {
        finalSanitized = sanitized;
        break;
      }

      // Step 3: If accuracy < 0.75, inject improved prompt to the old prompt and ask AI again
      wasRefined = true;
      console.log(`[Jev Accuracy Check] Confidence low (< 0.75). Critique: "${evalResult.reasoning}". Injecting improved prompt for re-generation...`);

      currentPrompt = `${basePrompt}

[CRITICAL PROMPT INJECTION & REFINEMENT REQUIRED]:
The previous code review was evaluated by the Jev verification engine and received a low accuracy score of ${(finalAccuracy * 100).toFixed(0)}% (< 75% threshold).
Evaluation Critique: ${evalResult.reasoning || 'The verdict or reported issues may not accurately align with the actual code execution.'}

Please re-evaluate the code with heightened precision:
1. Verify whether the code actually achieves the task: if it runs correctly without errors, verdict MUST be "correct" with no false issues.
2. If there are actual bugs, ensure each line number, error message, and suggestion is 100% accurate.
3. Respond ONLY with the corrected valid JSON structure.`;
    }

    if (!finalSanitized) {
      return FALLBACK_REVIEW;
    }

    return {
      ...finalSanitized,
      accuracy: finalAccuracy,
      confidence: finalAccuracy,
      refined: wasRefined,
      attempts,
    };
  } catch (err) {
    console.error('Error in reviewService:', err.message || err);
    if (rawOutput) {
      console.error('Raw model output was:\n', rawOutput);
    }
    return FALLBACK_REVIEW;
  }
}

module.exports = {
  reviewCode,
};

