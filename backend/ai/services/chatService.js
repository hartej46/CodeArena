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

function extractCoreMemory(history, currentPrompt = '') {
  if (!Array.isArray(history) || history.length === 0) {
    return '(No previous conversation context. This is the start of the session.)';
  }

  const cleanPrompt = String(currentPrompt || '').trim().toLowerCase();
  const filtered = history.filter((m, idx) => {
    if (!m || typeof m.content !== 'string') return false;
    const isLast = idx === history.length - 1;
    return !(isLast && m.role === 'user' && m.content.trim().toLowerCase() === cleanPrompt);
  });

  if (filtered.length === 0) return '(No previous conversation context.)';

  const recentSlice = filtered.slice(-6);
  const memoryLines = [];
  let turnNumber = 1;

  for (let i = 0; i < recentSlice.length; i++) {
    const msg = recentSlice[i];
    if (msg.role === 'user') {
      const nextMsg = recentSlice[i + 1];
      const assistantText = nextMsg && nextMsg.role === 'assistant' ? nextMsg.content : '';
      const userText = msg.content.length > 180 ? `${msg.content.slice(0, 180)}...` : msg.content;
      const botText = assistantText ? (assistantText.length > 180 ? `${assistantText.slice(0, 180)}...` : assistantText) : '';

      memoryLines.push(
        `- Turn ${turnNumber}: Student asked: "${userText}"${botText ? ` -> Tutor guided: "${botText}"` : ''}`
      );
      turnNumber++;
      if (assistantText) i++;
    }
  }

  return memoryLines.length > 0 ? memoryLines.join('\n') : '(No previous user prompts.)';
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
      prompt = '',
      history = [],
    } = input;

    const currentPrompt = (typeof message === 'string' && message.trim()) ? message.trim() : (typeof prompt === 'string' ? prompt.trim() : '');
    const memoryContext = extractCoreMemory(history, currentPrompt);

    const systemPrompt = getTutorPrompt({
      language,
      lesson,
      task,
      code,
      lastOutput,
      memoryContext,
    });

    const cleanPrompt = currentPrompt.toLowerCase();
    const cleanHistory = Array.isArray(history)
      ? history.filter((m, idx) => {
          if (!m || typeof m.content !== 'string') return false;
          const isLast = idx === history.length - 1;
          return !(isLast && m.role === 'user' && m.content.trim().toLowerCase() === cleanPrompt);
        })
      : [];

    const recentHistory = cleanHistory.slice(-6).map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: typeof msg.content === 'string' ? msg.content : '',
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: currentPrompt || 'Please review my current code and provide a hint.' },
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
