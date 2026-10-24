// Test script for Roadmap Generation and Diagnostic Questioning in AI Tutor
const ai = require('./index');

async function testRoadmapFlow() {
  console.log('=====================================================');
  console.log('    Testing Roadmap Generation & Diagnostics         ');
  console.log('=====================================================\n');

  console.log('--- Prompt: "I want to learn Python from basic" ---');
  const response = await ai.chat({
    language: 'Python',
    lesson: 'Introduction',
    task: '',
    code: '',
    lastOutput: '',
    message: 'I want to learn Python from basic',
    history: []
  });

  console.log('\nTutor Message:\n', response.message);

  if (response.roadmap && Object.keys(response.roadmap).length > 0) {
    console.log('\n[SUCCESS] Generated Roadmap:');
    console.log(JSON.stringify(response.roadmap, null, 2));
  } else {
    console.log('\n[INFO] No roadmap object returned (roadmap was empty).');
  }
}

testRoadmapFlow().catch(console.error);
