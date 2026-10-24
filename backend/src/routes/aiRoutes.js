// backend/src/routes/aiRoutes.js
// Express Router exposing AI Tutor Chat & Direct Code Evaluation endpoints

const express = require('express');
const router = express.Router();
const aiTutorService = require('../services/aiTutorService');
const dbStorageService = require('../services/dbStorageService');
const config = require('../../ai/config');

const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

function getUserIdFromReq(req) {
  if (req.body?.userId) return req.body.userId;
  if (req.query?.userId) return req.query.userId;
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.id;
    } catch {
      // ignore invalid token
    }
  }
  return null;
}

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

    const activeUserId = getUserIdFromReq(req);

    // Asynchronously persist chat interaction to database
    let storedSession = null;
    try {
      storedSession = await dbStorageService.saveChatInteraction({
        userId: activeUserId,
        sessionId: req.body.sessionId || req.body.chatId,
        userPrompt: prompt,
        assistantResponse: tutorResult,
        hintLevel: Number(hintLevel) || 1,
        courseId: req.body.courseId,
        lessonId: req.body.lessonId,
        lessonTitle: lesson,
        language,
        currentCode,
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
 * GET /api/ai/sessions
 * Returns stored chat sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const activeUserId = getUserIdFromReq(req);
    const sessions = await dbStorageService.listUserChatSessions(activeUserId);
    return res.json({ success: true, data: sessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/ai/sessions/:id
 * Deletes a chat session
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const activeUserId = getUserIdFromReq(req);
    const success = await dbStorageService.deleteChatSession(req.params.id, activeUserId);
    return res.json({ success });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/history/:sessionId
 * Returns message history for a given chat session
 */
router.get('/history/:sessionId', async (req, res) => {
  try {
    const messages = await dbStorageService.getChatHistory(req.params.sessionId);
    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/lesson-task?title=&language=
 * Fetches real lesson task requirements and details from PostgreSQL
 */
router.get('/lesson-task', async (req, res) => {
  try {
    const { title, language } = req.query;
    if (!title) return res.json({ success: true, lesson: null });

    const lesson = await prisma.lesson.findFirst({
      where: {
        title: { equals: title.trim(), mode: 'insensitive' },
      },
      include: {
        course: { select: { title: true, language: true } },
      },
    });

    return res.json({ success: true, lesson });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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

    const activeUserId = getUserIdFromReq(req) || userId;

    // Asynchronously persist submission and mistake patterns
    let storedSubmission = null;
    try {
      storedSubmission = await dbStorageService.saveCodeSubmission({
        userId: activeUserId,
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
