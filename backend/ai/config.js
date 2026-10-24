const path = require('path');
const dotenv = require('dotenv');

// Load environment files
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  get provider() {
    return process.env.AI_PROVIDER || 'ollama';
  },
  get googleKey() {
    return process.env.GOOGLE_API_KEY;
  },
  get googleModel() {
    return process.env.GOOGLE_MODEL;
  },
  get ollamaUrl() {
    return process.env.OLLAMA_URL || 'http://localhost:11434';
  },
  get ollamaModel() {
    return process.env.OLLAMA_MODEL || 'gemma4:e4b';
  },
  get jevModel() {
    return process.env.JEV_MODEL || 'llama3.2:latest';
  },

  validateConfig() {
    const missing = [];
    const activeProvider = this.provider;

    if (!activeProvider) {
      missing.push('AI_PROVIDER');
      return missing;
    }

    if (activeProvider === 'google') {
      if (!this.googleKey) missing.push('GOOGLE_API_KEY');
      if (!this.googleModel) missing.push('GOOGLE_MODEL');
    } else if (activeProvider === 'ollama') {
      // ollamaUrl has a default fallback, so only check ollamaModel
      if (!this.ollamaModel) missing.push('OLLAMA_MODEL');
    } else {
      missing.push(`AI_PROVIDER (unsupported: ${activeProvider})`);
    }

    return missing;
  },
};

module.exports = config;
