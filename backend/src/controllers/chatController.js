// backend/src/controllers/chatController.js
const { z } = require('zod');
const chatService = require('../services/chatService');

const createSessionSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  lessonId: z.string().uuid('Invalid lesson ID').optional().nullable(),
});

const postMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
  code: z.string().max(6000, 'Code cannot exceed 6000 characters').optional().default(''),
  lastOutput: z.string().max(2000, 'Output cannot exceed 2000 characters').optional().default(''),
});

/**
 * POST /api/chat/sessions
 */
async function createSession(req, res, next) {
  try {
    const input = createSessionSchema.parse(req.body);
    const session = await chatService.createSession(req.user.id, input);
    res.status(201).json({ data: session });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/sessions?courseId=
 */
async function listSessions(req, res, next) {
  try {
    const courseId = typeof req.query.courseId === 'string' ? req.query.courseId.trim() : null;
    const sessions = await chatService.listSessions(req.user.id, courseId);
    res.status(200).json({ data: sessions });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/sessions/:id/messages
 */
async function getSessionMessages(req, res, next) {
  try {
    const messages = await chatService.getSessionMessages(req.user.id, req.params.id);
    res.status(200).json({ data: messages });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/sessions/:id/messages
 */
async function sendMessage(req, res, next) {
  try {
    const input = postMessageSchema.parse(req.body);
    const reply = await chatService.postMessage(req.user.id, req.params.id, input);
    res.status(200).json({ data: reply });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSession,
  listSessions,
  getSessionMessages,
  sendMessage,
};
