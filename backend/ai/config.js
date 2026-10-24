const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const provider = process.env.AI_PROVIDER;
const googleKey = process.env.GOOGLE_API_KEY;
const googleModel = process.env.GOOGLE_MODEL;
const ollamaUrl = process.env.OLLAMA_URL;
const ollamaModel = process.env.OLLAMA_MODEL;

function validateConfig() {
  const missing = [];
  const activeProvider = process.env.AI_PROVIDER || provider;

  if (!activeProvider) {
    missing.push('AI_PROVIDER');
    return missing;
  }

  if (activeProvider === 'google') {
    if (!process.env.GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY');
    if (!process.env.GOOGLE_MODEL) missing.push('GOOGLE_MODEL');
  } else if (activeProvider === 'ollama') {
    if (!process.env.OLLAMA_URL) missing.push('OLLAMA_URL');
    if (!process.env.OLLAMA_MODEL) missing.push('OLLAMA_MODEL');
  } else {
    missing.push(`AI_PROVIDER (unsupported: ${activeProvider})`);
  }

  return missing;
}

module.exports = {
  provider,
  googleKey,
  googleModel,
  ollamaUrl,
  ollamaModel,
  validateConfig,
};
