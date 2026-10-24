// backend/src/testDbStorage.js
// Verification script for Prisma data persistence

require('dotenv').config();
const { prisma } = require('./prisma');
const dbStorageService = require('./services/dbStorageService');

async function main() {
  console.log('--- CodeArena Prisma Data Persistence Test ---');
  console.log('Database URL configured:', Boolean(process.env.DATABASE_URL));

  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL is not set in backend/.env. Please provide a Neon or PostgreSQL connection string.');
    process.exit(0);
  }

  try {
    console.log('1. Connecting to PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');

    console.log('2. Creating / Fetching learner user...');
    const user = await dbStorageService.getOrCreateDefaultUser('test_learner@codearena.dev', 'Test Learner');
    console.log('✅ Learner user:', user.id, user.email);

    console.log('3. Storing sample ChatSession & ChatMessages...');
    const chatResult = await dbStorageService.saveChatInteraction({
      userId: user.id,
      userPrompt: 'How do I iterate over a list in Python?',
      assistantResponse: {
        message: 'Think about how a `for` loop inspects each element one at a time. What variable will represent the current item?',
        hintLevel: 1,
      },
      hintLevel: 1,
    });
    console.log('✅ Chat interaction stored! Session ID:', chatResult?.session?.id);

    console.log('4. Storing sample Code Submission & Bug Pattern...');
    const subResult = await dbStorageService.saveCodeSubmission({
      userId: user.id,
      sessionId: chatResult?.session?.id,
      language: 'Python',
      code: 'for i in range(len(nums)):\n  print(nums[i])',
      evaluationResult: {
        verdict: 'correct',
        confidence: 0.98,
        testCaseStatus: { passed: 3, total: 3 },
      },
    });
    console.log('✅ Submission stored! Submission ID:', subResult?.id);

    console.log('5. Querying database records to verify...');
    const totalUsers = await prisma.user.count();
    const totalSessions = await prisma.chatSession.count();
    const totalMessages = await prisma.chatMessage.count();
    const totalSubmissions = await prisma.submission.count();

    console.log('📊 Current Database Totals:');
    console.log(`   - Users: ${totalUsers}`);
    console.log(`   - Sessions: ${totalSessions}`);
    console.log(`   - Messages: ${totalMessages}`);
    console.log(`   - Submissions: ${totalSubmissions}`);
    console.log('🎉 Data storage verification complete!');
  } catch (err) {
    console.error('❌ Data storage test failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
