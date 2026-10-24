// backend/src/routes/aiRoutes.js
// Express Router exposing AI Tutor Chat & Direct Code Evaluation endpoints

const express = require('express');
const router = express.Router();
const aiTutorService = require('../services/aiTutorService');
const dbStorageService = require('../services/dbStorageService');
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

    // Asynchronously persist chat interaction to database
    let storedSession = null;
    try {
      storedSession = await dbStorageService.saveChatInteraction({
        userId: req.body.userId,
        sessionId: req.body.sessionId,
        userPrompt: prompt,
        assistantResponse: tutorResult,
        hintLevel: Number(hintLevel) || 1,
        courseId: req.body.courseId,
        lessonId: req.body.lessonId,
        metadata: { language, currentCode: currentCode ? currentCode.slice(0, 500) : '' },
      });
    } catch (saveErr) {
      console.warn('Chat persistence warning:', saveErr.message);
    }

    return res.json({
      success: true,
      data: tutorResult,
      dbSessionId: storedSession?.session?.id || req.body.sessionId || null,
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
      userId,
      sessionId,
      lessonId,
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

    // Asynchronously persist submission and mistake patterns
    let storedSubmission = null;
    try {
      storedSubmission = await dbStorageService.saveCodeSubmission({
        userId,
        sessionId,
        lessonId,
        language,
        code: currentCode,
        evaluationResult,
      });
    } catch (subErr) {
      console.warn('Submission persistence warning:', subErr.message);
    }

    return res.json({
      success: true,
      data: evaluationResult,
      submissionId: storedSubmission?.id || null,
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
