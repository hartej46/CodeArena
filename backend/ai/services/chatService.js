// Handles tutor chat interactions and context management.
const { callModel } = require('../provider');
const getTutorPrompt = require('../prompts/tutor');
const parseJson = require('../utils/parseJson');

const FALLBACK_TUTOR = {
  message: "I'm having a little trouble connecting right now. Please try asking again in a moment!",
  fix: {},
  issue: {},
  example: {},
  next_step: {},
  roadmap: {},
};

function sanitizeTutorResponse(parsed, rawReply) {
  if (parsed && typeof parsed === 'object') {
    const message =
      typeof parsed.message === 'string' && parsed.message.trim()
        ? parsed.message.trim()
        : (typeof rawReply === 'string' && rawReply.trim() ? rawReply.trim() : FALLBACK_TUTOR.message);

    const fix = parsed.fix && typeof parsed.fix === 'object' && !Array.isArray(parsed.fix) ? parsed.fix : {};
    const issue = parsed.issue && typeof parsed.issue === 'object' && !Array.isArray(parsed.issue) ? parsed.issue : {};
    const example =
      parsed.example && typeof parsed.example === 'object' && !Array.isArray(parsed.example) ? parsed.example : {};
    const next_step =
      parsed.next_step && typeof parsed.next_step === 'object' && !Array.isArray(parsed.next_step)
        ? parsed.next_step
        : {};
    const roadmap =
      parsed.roadmap && typeof parsed.roadmap === 'object' && !Array.isArray(parsed.roadmap)
        ? parsed.roadmap
        : {};

    const result = {
      message,
      fix,
      issue,
      example,
      next_step,
      roadmap,
    };

    // Allows string-based consumers to treat the result as a string if needed
    Object.defineProperty(result, 'toString', {
      value: function () {
        return this.message;
      },
      enumerable: false,
    });

    return result;
  }

  const fallback = { ...FALLBACK_TUTOR };
  Object.defineProperty(fallback, 'toString', {
    value: function () {
      return this.message;
    },
    enumerable: false,
  });
  return fallback;
}

async function chat(input = {}) {
  let rawReply = '';
  try {
    const {
      language = 'Python',
      lesson = 'General',
      task = '',
      code = '',
      lastOutput = '',
      message = '',
      history = [],
    } = input;

    const systemPrompt = getTutorPrompt({ language, lesson, task, code, lastOutput });

    // Keep chat history short: send only the last ~6 messages
    const recentHistory = Array.isArray(history)
      ? history.slice(-6).map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: typeof msg.content === 'string' ? msg.content : '',
        }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: typeof message === 'string' ? message : '' },
    ];

    // Use lower temperature for JSON adherence
    rawReply = await callModel(messages, { temperature: 0.2 });

    let parsed = null;
    try {
      parsed = parseJson(rawReply);
    } catch (parseErr) {
      console.warn('chatService: JSON parsing failed, using raw reply if available:', parseErr.message);
    }

    return sanitizeTutorResponse(parsed, rawReply);
  } catch (err) {
    console.error('Error in chatService:', err.message || err);
    if (rawReply) {
      console.error('Raw model output was:\n', rawReply);
    }
    return sanitizeTutorResponse(null, '');
  }
}

module.exports = {
  chat,
};
