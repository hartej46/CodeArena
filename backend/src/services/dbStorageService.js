// backend/src/services/dbStorageService.js
// Service to persist chat sessions, messages, evaluations, and roadmaps to PostgreSQL via Prisma
const prisma = require('../lib/prisma');
const { recordActivity } = require('./streakService');

function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

/**
 * Get or create a default user for sessions without explicit auth tokens
 */
async function getOrCreateDefaultUser(email = 'learner@codearena.dev', name = 'CodeArena Learner') {
  if (!isDbConfigured()) return null;

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      console.log(`[DB] Created default user: ${user.id} (${email})`);
    }

    return user;
  } catch (err) {
    console.warn('[DB] Failed to get/create user:', err.message);
    return null;
  }
}

/**
 * Ensures a valid course ID exists for session creation
 */
async function getOrCreateDefaultCourse(language = 'Python') {
  const slug = `${language.toLowerCase()}-core`;
  let course = await prisma.course.findFirst({
    where: {
      OR: [{ slug }, { language }],
    },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        slug,
        title: `${language} Core Mastery`,
        language,
      },
    });
  }

  return course;
}

/**
 * Persists an AI chat exchange (user prompt and assistant response)
 */
async function saveChatInteraction({
  userId,
  sessionId,
  userPrompt,
  assistantResponse,
  hintLevel = 1,
  lessonId = null,
  courseId = null,
  lessonTitle = null,
  language = 'Python',
  currentCode = '',
}) {
  if (!isDbConfigured()) return null;

  try {
    let activeUser = null;
    if (userId) {
      activeUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!activeUser) {
      activeUser = await getOrCreateDefaultUser();
    }
    if (!activeUser) return null;

    let activeSession = null;
    if (sessionId) {
      activeSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    }

    // Reuse session matching lesson title if no explicit sessionId passed
    if (!activeSession && lessonTitle) {
      activeSession = await prisma.chatSession.findFirst({
        where: {
          userId: activeUser.id,
          title: lessonTitle,
        },
        orderBy: { lastMessageAt: 'desc' },
      });
    }

    if (!activeSession) {
      let validCourseId = courseId;
      if (!validCourseId) {
        const defaultCourse = await getOrCreateDefaultCourse(language);
        validCourseId = defaultCourse.id;
      }

      activeSession = await prisma.chatSession.create({
        data: {
          id: sessionId || undefined,
          userId: activeUser.id,
          courseId: validCourseId,
          lessonId: lessonId || null,
          title: lessonTitle || (userPrompt ? userPrompt.slice(0, 50).trim() : 'Tutor Session'),
          lastMessageAt: new Date(),
        },
      });
    }

    // Save User message
    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: 'user',
        content: userPrompt,
        codeSnapshot: currentCode || null,
      },
    });

    // Save Assistant message
    const assistantContent =
      typeof assistantResponse === 'string'
        ? assistantResponse
        : assistantResponse?.message || JSON.stringify(assistantResponse);

    const botMsg = await prisma.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: 'assistant',
        content: assistantContent,
        aiPayload: typeof assistantResponse === 'object' ? assistantResponse : { message: assistantContent },
      },
    });

    // Update session timestamp & title
    await prisma.chatSession.update({
      where: { id: activeSession.id },
      data: {
        lastMessageAt: new Date(),
        title: activeSession.title || userPrompt.slice(0, 50).trim(),
      },
    });

    // Record HintEvent if hintLevel > 1
    if (hintLevel && Number(hintLevel) >= 1) {
      await prisma.hintEvent.create({
        data: {
          userId: activeUser.id,
          lessonId: lessonId || null,
          sessionId: activeSession.id,
          level: Math.min(Math.max(Number(hintLevel), 1), 4),
        },
      }).catch((e) => console.warn('[DB] Failed to log HintEvent:', e.message));
    }

    // Upsert activity day
    await recordActivity(activeUser.id);

    return {
      session: activeSession,
      userMessage: userMsg,
      assistantMessage: botMsg,
    };
  } catch (err) {
    console.warn('[DB] saveChatInteraction error:', err.message);
    return null;
  }
}

/**
 * Persists code submission evaluation results
 */
async function saveCodeSubmission({
  userId,
  sessionId = null,
  lessonId = null,
  language = 'Python',
  code = '',
  evaluationResult = null,
  testsPassed = 0,
  testsTotal = 0,
}) {
  if (!isDbConfigured()) return null;

  try {
    let activeUser = null;
    if (userId) {
      activeUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!activeUser) {
      activeUser = await getOrCreateDefaultUser();
    }
    if (!activeUser) return null;

    const verdict = evaluationResult?.verdict === 'correct' ? 'correct' : 'incorrect';
    const confidence = evaluationResult?.confidence || (verdict === 'correct' ? 0.95 : 0.85);

    const submission = await prisma.submission.create({
      data: {
        userId: activeUser.id,
        sessionId: sessionId || null,
        lessonId: lessonId || null,
        language,
        code,
        verdict,
        confidence,
        testsPassed: evaluationResult?.testCaseStatus?.passed ?? testsPassed,
        testsTotal: evaluationResult?.testCaseStatus?.total ?? testsTotal,
        review: evaluationResult || {},
      },
    });

    // Store BugPattern & Mistake if bugDna exists
    if (evaluationResult?.bugDna?.type) {
      const bugType = evaluationResult.bugDna.type;
      let pattern = await prisma.bugPattern.findUnique({
        where: { name: bugType },
      });

      if (!pattern) {
        pattern = await prisma.bugPattern.create({
          data: {
            name: bugType,
            category: 'logic',
            defaultSeverity: 'medium',
          },
        }).catch(() => null);
      }

      if (pattern) {
        await prisma.mistake.create({
          data: {
            userId: activeUser.id,
            patternId: pattern.id,
            submissionId: submission.id,
            line: evaluationResult.bugDna.line || null,
            explanation: evaluationResult.bugDna.message || null,
          },
        }).catch((e) => console.warn('[DB] Failed to log Mistake:', e.message));
      }
    }

    // Upsert activity day
    await recordActivity(activeUser.id);

    return submission;
  } catch (err) {
    console.warn('[DB] saveCodeSubmission error:', err.message);
    return null;
  }
}

/**
 * Stores or updates a generated roadmap (Course, Concepts, and Lessons)
 */
async function saveRoadmap({ title, language, concepts = [] }) {
  if (!isDbConfigured()) return null;

  try {
    const slug = `${language.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 60);

    let course = await prisma.course.findUnique({
      where: { slug },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          slug,
          title,
          language,
        },
      });
    }

    for (let cIdx = 0; cIdx < concepts.length; cIdx++) {
      const c = concepts[cIdx];
      const concept = await prisma.concept.create({
        data: {
          courseId: course.id,
          name: c.name || `Concept ${cIdx + 1}`,
          position: cIdx + 1,
        },
      });

      if (Array.isArray(c.lessons)) {
        for (let lIdx = 0; lIdx < c.lessons.length; lIdx++) {
          const l = c.lessons[lIdx];
          await prisma.lesson.create({
            data: {
              courseId: course.id,
              conceptId: concept.id,
              title: l.title || `Lesson ${lIdx + 1}`,
              kind: l.kind || 'core',
              estMinutes: l.estMinutes || 15,
              task: l.task || null,
              position: lIdx + 1,
            },
          });
        }
      }
    }

    return course;
  } catch (err) {
    console.warn('[DB] saveRoadmap error:', err.message);
    return null;
  }
}

/**
 * Retrieves chat message history for a given session ID
 */
async function getChatHistory(sessionId) {
  if (!isDbConfigured() || !sessionId) return [];
  try {
    return await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  } catch (err) {
    console.warn('[DB] getChatHistory error:', err.message);
    return [];
  }
}

/**
 * Lists all chat sessions for a user (or default user)
 */
async function listUserChatSessions(userId = null) {
  if (!isDbConfigured()) return [];
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const defaultUser = await getOrCreateDefaultUser();
      targetUserId = defaultUser?.id;
    }
    if (!targetUserId) return [];

    return await prisma.chatSession.findMany({
      where: { userId: targetUserId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, language: true } },
        _count: { select: { messages: true } },
      },
    });
  } catch (err) {
    console.warn('[DB] listUserChatSessions error:', err.message);
    return [];
  }
}

module.exports = {
  isDbConfigured,
  getOrCreateDefaultUser,
  getOrCreateDefaultCourse,
  saveChatInteraction,
  saveCodeSubmission,
  saveRoadmap,
  getChatHistory,
  listUserChatSessions,
};
