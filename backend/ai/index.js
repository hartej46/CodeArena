// Main entry point for the AI engine module exported to teammates.
const { chat } = require('./services/chatService');
const { reviewCode } = require('./services/reviewService');
const jev = require('./services/jevEngine');

module.exports = {
  chat,
  reviewCode,
  jev,
};
