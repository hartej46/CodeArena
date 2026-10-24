// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
    },
  },
});

/**
 * Stricter rate limiter for AI-intensive routes (chat, review, hints, placement)
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'AI request limit reached for this window. Please wait a few minutes before trying again.',
    },
  },
});

module.exports = {
  standardLimiter,
  aiLimiter,
};
