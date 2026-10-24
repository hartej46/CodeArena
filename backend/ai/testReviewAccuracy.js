// Tests Jev-powered code review accuracy check and prompt refinement
const ai = require('./index');

async function testReviewAccuracy() {
  console.log('=====================================================');
  console.log('   Testing Jev Accuracy & Self-Refinement in Review   ');
  console.log('=====================================================\n');

  console.log('--- Reviewing Student Code ---');
  const reviewResult = await ai.reviewCode({
    language: 'python',
    task: 'Write a while loop to print numbers from 1 to 5',
    code: 'i = 1\nwhile i <= 5:\n    print(i)\n    i += 1',
    lastOutput: '1\n2\n3\n4\n5'
  });

  console.log('\nFinal Review Output:');
  console.log(JSON.stringify(reviewResult, null, 2));

  if (reviewResult.accuracy !== undefined) {
    console.log(`\nVerified: AI generated accuracy probability: ${(reviewResult.accuracy * 100).toFixed(1)}%`);
    console.log(`Self-Refinement triggered: ${reviewResult.refined ? 'YES (<0.75 threshold)' : 'NO (Met >=0.75 threshold on first pass)'}`);
  }
}

testReviewAccuracy().catch(console.error);
