// backend/src/routes/aiRoutes.js
// Express Router exposing AI Tutor Chat & Direct Code Evaluation endpoints

const express = require('express');
const router = express.Router();
const aiTutorService = require('../services/aiTutorService');
const config = require('../../ai/config');

/**
 * GET /api/ai/health
 * Health check & provider status
 */
router.get('/health', (req, res) => {
  const missing = config.validateConfig();
  const isReady = missing.length === 0;

  res.json({
    status: 'ok',
    provider: config.provider || 'none',
    isReady,
    missingEnv: isReady ? [] : missing,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/ai/chat
 * User prompt + current code editor context
 */
router.post('/chat', async (req, res) => {
  try {
    const {
      prompt,
      currentCode = '',
      language = 'Python',
      lesson = 'General',
      task = '',
      history = [],
      hintLevel = 1,
    } = req.body;

    if (!prompt && !currentCode) {
      return res.status(400).json({
        success: false,
        error: 'Either "prompt" or "currentCode" must be provided.',
      });
    }

    const tutorResult = await aiTutorService.handleChat({
      prompt: typeof prompt === 'string' ? prompt : '',
      currentCode: typeof currentCode === 'string' ? currentCode : '',
      language,
      lesson,
      task,
      history,
      hintLevel: Number(hintLevel) || 1,
    });

    return res.json({
      success: true,
      data: tutorResult,
    });
  } catch (err) {
    console.error('Error in POST /api/ai/chat:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate Socratic tutor response.',
      details: err.message,
    });
  }
});

/**
 * POST /api/ai/evaluate
 * Direct code submission for automated Bug DNA & State Divergence analysis
 */
router.post('/evaluate', async (req, res) => {
  try {
    const {
      currentCode,
      problemId = '',
      language = 'Python',
      task = '',
      lastOutput = '',
    } = req.body;

    if (!currentCode || typeof currentCode !== 'string' || !currentCode.trim()) {
      return res.status(400).json({
        success: false,
        error: '"currentCode" is required for code evaluation.',
      });
    }

    const evaluationResult = await aiTutorService.handleEvaluate({
      currentCode,
      problemId,
      language,
      task,
      lastOutput,
    });

    return res.json({
      success: true,
      data: evaluationResult,
    });
  } catch (err) {
    console.error('Error in POST /api/ai/evaluate:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate submitted code.',
      details: err.message,
    });
  }
});

module.exports = router;
