// backend/src/services/chatService.js
const prisma = require('../lib/prisma');
const ai = require('../../ai');
const { AppError } = require('../middleware/errorHandler');
const { recordActivity } = require('./streakService');

/**
 * Creates a new ChatSession for the authenticated user
 */
async function createSession(userId, { courseId, lessonId = null }) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found.', 404);
  }

  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson || lesson.courseId !== courseId) {
      throw new AppError('Lesson not found or does not belong to the selected course.', 404);
    }
  }

  const session = await prisma.chatSession.create({
    data: {
      userId,
      courseId,
      lessonId: lessonId || null,
      title: null,
      lastMessageAt: new Date(),
    },
    include: {
      course: {
        select: { id: true, title: true, language: true },
      },
      lesson: {
        select: { id: true, title: true },
      },
    },
  });

  return session;
}

/**
 * Lists user's chat sessions, optionally filtered by courseId, newest first
 */
async function listSessions(userId, courseId = null) {
  const whereClause = { userId };
  if (courseId) {
    whereClause.courseId = courseId;
  }

  const sessions = await prisma.chatSession.findMany({
    where: whereClause,
    orderBy: { lastMessageAt: 'desc' },
    include: {
      course: {
        select: { id: true, title: true, language: true },
      },
      lesson: {
        select: { id: true, title: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    userId: s.userId,
    courseId: s.courseId,
    lessonId: s.lessonId,
    title: s.title || 'Untitled Session',
    createdAt: s.createdAt,
    lastMessageAt: s.lastMessageAt,
    course: s.course,
    lesson: s.lesson,
    messageCount: s._count.messages,
  }));
}

/**
 * Retrieves all chat messages for a session belonging to the user in chronological order
 */
async function getSessionMessages(userId, sessionId) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  // Ownership check: session must exist and belong to req.user.id
  if (!session || session.userId !== userId) {
    throw new AppError('Chat session not found.', 404);
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

/**
 * Sends a message in a chat session:
 * 1. Verify session belongs to user
 * 2. Insert user ChatMessage
 * 3. Load last 6 messages as history
 * 4. Load lesson and course language
 * 5. Call ai.chat(...)
 * 6. Insert assistant ChatMessage
 * 7. Update session lastMessageAt & title if empty
 * 8. Upsert ActivityDay
 */
async function postMessage(userId, sessionId, { message, code = '', lastOutput = '' }) {
  // 1. Verify the session belongs to the user
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      course: true,
      lesson: true,
    },
  });

  if (!session || session.userId !== userId) {
    throw new AppError('Chat session not found.', 404);
  }

  // 2. Insert the user ChatMessage (with codeSnapshot = code)
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: 'user',
      content: message,
      codeSnapshot: code || null,
    },
  });

  // 3. Load the last 6 messages as history ({role, content}) before the assistant responds
  const recentMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: 7, // Take 7 (includes the just inserted user message + up to 6 prior)
  });

  // Reverse to chronological order and exclude the current message from history array
  const chronological = recentMessages.reverse();
  const historyMessages = chronological.slice(0, -1).slice(-6).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 4. Load the lesson (title, task) and the course language
  const language = session.course?.language || 'Python';
  const lessonTitle = session.lesson?.title || 'General Practice';
  const lessonTask = session.lesson?.task || '';

  // 5. Call ai.chat(...)
  const reply = await ai.chat({
    language,
    lesson: lessonTitle,
    task: lessonTask,
    code,
    lastOutput,
    message,
    history: historyMessages,
  });

  // 6. Insert the assistant ChatMessage: content = reply.message, aiPayload = full reply object
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: 'assistant',
      content: reply.message || 'I have reviewed your message.',
      aiPayload: reply,
    },
  });

  // 7. Update session.lastMessageAt and set title from first user message if empty
  const updateData = {
    lastMessageAt: new Date(),
  };

  if (!session.title || !session.title.trim()) {
    updateData.title = message.slice(0, 50).trim();
  }

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: updateData,
  });

  // 8. Upsert ActivityDay
  await recordActivity(userId);

  return reply;
}

module.exports = {
  createSession,
  listSessions,
  getSessionMessages,
  postMessage,
};
