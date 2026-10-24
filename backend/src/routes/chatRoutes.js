// backend/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimit');

// All chat routes require authentication
router.use(authenticate);

router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.listSessions);
router.get('/sessions/:id/messages', chatController.getSessionMessages);
router.post('/sessions/:id/messages', aiLimiter, chatController.sendMessage);

module.exports = router;
