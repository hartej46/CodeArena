// Tests AI engine features without needing an Express server.
const config = require('./config');
const ai = require('./index');

async function runTests() {
  console.log('========================================');
  console.log('          AI Engine Test Suite          ');
  console.log('========================================');
  console.log(`Active Provider: ${config.provider || '(none)'}`);

  const missing = config.validateConfig();
  if (missing.length > 0) {
    console.warn(`\n[WARNING] Missing environment variables for provider "${config.provider}":`);
    missing.forEach((m) => console.warn(`  - ${m}`));
    console.warn('Tests will exercise error handling and fallback behavior.\n');
  } else {
    console.log('[OK] Provider configuration is valid.\n');
  }

  // 1. Test chat
  console.log('----------------------------------------');
  console.log('1. Testing ai.chat()');
  console.log('----------------------------------------');
  const chatInput = {
    language: 'python',
    lesson: 'while loop',
    task: 'Print numbers 1 to 5 using a while loop',
    code: 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1',
    lastOutput: '0\n1\n2',
    message: 'Can you explain how the condition is checked on each iteration?',
    history: [],
  };
  const chatReply = await ai.chat(chatInput);
  console.log('Tutor Reply (JSON):\n', JSON.stringify(chatReply, null, 2));

  // 2. Test reviewCode - Case 1: Correct code
  console.log('\n----------------------------------------');
  console.log('2. Testing ai.reviewCode() - Case 1: Correct Code');
  console.log('----------------------------------------');
  const reviewCase1 = await ai.reviewCode({
    language: 'python',
    task: 'Print numbers from 1 to 5 using a while loop',
    code: 'i = 1\nwhile i <= 5:\n    print(i)\n    i += 1',
    lastOutput: '1\n2\n3\n4\n5',
  });
  console.log('Result:', JSON.stringify(reviewCase1, null, 2));

  // 3. Test reviewCode - Case 2: Syntax error
  console.log('\n----------------------------------------');
  console.log('3. Testing ai.reviewCode() - Case 2: Syntax Error');
  console.log('----------------------------------------');
  const reviewCase2 = await ai.reviewCode({
    language: 'python',
    task: 'Print numbers from 1 to 5 using a while loop',
    code: 'i = 1\nwhile i <= 5\n    print(i)\n    i += 1',
    lastOutput: 'SyntaxError: expected \':\'',
  });
  console.log('Result:', JSON.stringify(reviewCase2, null, 2));

  // 4. Test reviewCode - Case 3: While loop that never increments
  console.log('\n----------------------------------------');
  console.log('4. Testing ai.reviewCode() - Case 3: Infinite Loop Bug');
  console.log('----------------------------------------');
  const reviewCase3 = await ai.reviewCode({
    language: 'python',
    task: 'Print numbers from 1 to 5 using a while loop',
    code: 'i = 1\nwhile i <= 5:\n    print(i)',
    lastOutput: '1\n1\n1\n1\n... (timed out / infinite loop)',
  });
  console.log('Result:', JSON.stringify(reviewCase3, null, 2));

  console.log('\n========================================');
  console.log('              Tests Ended               ');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
});
