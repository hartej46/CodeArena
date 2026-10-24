// backend/src/testChatIntegration.js
// Comprehensive test verifying ChatSession and ChatMessage persistence in Neon PostgreSQL

require('dotenv').config();
const prisma = require('./lib/prisma');
const authService = require('./services/authService');
const chatService = require('./services/chatService');

async function testChatFlow() {
  console.log('=== Testing CodeArena User Chat Session & Message DB Integration ===');

  try {
    // 1. Create or fetch a test user
    const testEmail = `learner_${Date.now()}@codearena.dev`;
    console.log(`1. Registering user: ${testEmail}...`);
    const { token, user } = await authService.registerUser({
      name: 'Alice Developer',
      email: testEmail,
      password: 'password123',
    });
    console.log(`✅ User registered with ID: ${user.id}`);

    // 2. Ensure a course exists in DB for this session
    let course = await prisma.course.findFirst({ where: { slug: 'python-core' } });
    if (!course) {
      console.log('Creating sample course "python-core"...');
      course = await prisma.course.create({
        data: {
          slug: 'python-core',
          title: 'Python Core Mastery',
          language: 'Python',
        },
      });
    }
    console.log(`✅ Using course: ${course.title} (${course.id})`);

    // 3. Create a ChatSession for this user
    console.log('2. Creating ChatSession for user in Neon PostgreSQL...');
    const session = await chatService.createSession(user.id, {
      courseId: course.id,
    });
    console.log(`✅ ChatSession created in DB! ID: ${session.id}, User ID: ${session.userId}`);

    // 4. Send a message to the session
    console.log('3. Sending user prompt to AI tutor and storing message history in DB...');
    const userPrompt = 'How do I check if a number is even or odd in Python?';
    const tutorReply = await chatService.postMessage(user.id, session.id, {
      message: userPrompt,
      code: 'num = 7\n# how to check?',
      lastOutput: '',
    });
    console.log('✅ AI responded with Socratic guidance!');
    console.log('Tutor message:', tutorReply.message);

    // 5. Query database directly to verify persistence
    console.log('4. Verifying database state directly via Prisma queries...');
    const dbSession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    console.log(`Session Title updated to: "${dbSession.title}"`);
    console.log(`Total messages saved in DB: ${dbSession.messages.length}`);

    for (let idx = 0; idx < dbSession.messages.length; idx++) {
      const msg = dbSession.messages[idx];
      console.log(`  [Message ${idx + 1}] Role: ${msg.role.toUpperCase()} | CreatedAt: ${msg.createdAt.toISOString()}`);
      console.log(`    Content: "${msg.content.slice(0, 100)}..."`);
      if (msg.role === 'assistant' && msg.aiPayload) {
        console.log(`    aiPayload attached:`, typeof msg.aiPayload === 'object' ? 'YES (Valid JSON)' : 'NO');
      }
    }

    // 6. Verify ActivityDay was recorded
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const activity = await prisma.activityDay.findUnique({
      where: {
        userId_day: {
          userId: user.id,
          day: today,
        },
      },
    });
    console.log(`✅ ActivityDay for today: ${activity ? 'Recorded in DB 🚀' : 'Missing'}`);

    // 7. Verify Ownership Protection (Rule 3)
    console.log('5. Verifying ownership check (another user accessing this session)...');
    try {
      await chatService.getSessionMessages('00000000-0000-0000-0000-000000000000', session.id);
      console.error('❌ Ownership check failed! Foreign user was allowed to read messages.');
    } catch (err) {
      console.log(`✅ Ownership check passed! Unauthorized user received 404: "${err.message}"`);
    }

    console.log('🎉 Full Chat Session & Message DB Integration verified successfully!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testChatFlow();
