// Handles code review requests, structured output validation, and fallback handling.
const { callModel } = require('../provider');
const getReviewPrompt = require('../prompts/review');
const parseJson = require('../utils/parseJson');

const FALLBACK_REVIEW = {
  verdict: 'incorrect',
  issues: [],
  feedback: 'Unable to complete code review at this time. Please check your setup and try again.',
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
    const prompt = getReviewPrompt({ language, task, code, lastOutput });

    const messages = [
      { role: 'user', content: prompt },
    ];

    // Use low temperature (0.1) for JSON outputs
    rawOutput = await callModel(messages, { temperature: 0.1 });

    const parsed = parseJson(rawOutput);
    const sanitized = validateAndSanitize(parsed);

    if (!sanitized) {
      console.error('Invalid review JSON shape from model. Raw output was:\n', rawOutput);
      return FALLBACK_REVIEW;
    }

    return sanitized;
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
