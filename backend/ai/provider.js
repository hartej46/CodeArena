// The only file that interacts directly with the AI models (Google API / Ollama).
const { GoogleGenAI } = require('@google/genai');
const config = require('./config');

function toGoogleContents(messages) {
  const systemContents = [];
  const otherMessages = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemContents.push(msg.content);
    } else {
      otherMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Merge system messages into the first user message (Gemma quirk)
  if (systemContents.length > 0) {
    const systemPromptText = systemContents.join('\n\n');
    const firstUserIndex = otherMessages.findIndex((m) => m.role === 'user');

    if (firstUserIndex !== -1) {
      const existingText = otherMessages[firstUserIndex].parts[0]?.text || '';
      otherMessages[firstUserIndex].parts[0].text = `${systemPromptText}\n\n${existingText}`;
    } else {
      otherMessages.unshift({
        role: 'user',
        parts: [{ text: systemPromptText }],
      });
    }
  }

  return otherMessages;
}

async function callGoogle(messages, temperature) {
  try {
    const genai = new GoogleGenAI({ apiKey: config.googleKey });
    const response = await genai.models.generateContent({
      model: config.googleModel,
      contents: toGoogleContents(messages),
      config: { temperature },
    });
    return response.text ?? '';
  } catch (err) {
    throw new Error(`Google GenAI SDK error: ${err.message || err}`);
  }
}

async function callOllama(messages, temperature) {
  const url = `${(config.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '')}/api/chat`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        options: {
          temperature,
        },
      }),
    });
  } catch (err) {
    throw new Error(`Ollama connection error (${url}): ${err.message || err}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Ollama API error (HTTP ${response.status} ${response.statusText}): ${errorBody}`);
  }

  const data = await response.json();
  return data.message?.content ?? '';
}

async function callModel(messages, options = {}) {
  const temperature = options.temperature ?? 0.7;
  const activeProvider = config.provider;

  if (activeProvider === 'google') {
    if (!config.googleKey || !config.googleModel) {
      const missing = [];
      if (!config.googleKey) missing.push('GOOGLE_API_KEY');
      if (!config.googleModel) missing.push('GOOGLE_MODEL');
      throw new Error(`Google provider misconfigured. Missing environment variable(s): ${missing.join(', ')}`);
    }
    return await callGoogle(messages, temperature);
  }

  if (activeProvider === 'ollama') {
    if (!config.ollamaUrl || !config.ollamaModel) {
      const missing = [];
      if (!config.ollamaUrl) missing.push('OLLAMA_URL');
      if (!config.ollamaModel) missing.push('OLLAMA_MODEL');
      throw new Error(`Ollama provider misconfigured. Missing environment variable(s): ${missing.join(', ')}`);
    }
    return await callOllama(messages, temperature);
  }

  throw new Error(`Unsupported or missing AI_PROVIDER: "${activeProvider}". Must be "google" or "ollama".`);
}

module.exports = {
  callModel,
};