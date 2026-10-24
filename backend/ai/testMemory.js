// Test script verifying AI Tutor Memory across previous 2-3 core prompts
const aiTutorService = require('../src/services/aiTutorService');

async function testConversationMemory() {
  console.log('=====================================================');
  console.log('     Testing AI Tutor 2-3 Prompt Context Memory      ');
  console.log('=====================================================\n');

  // Simulated 3-turn history of a student learning Python loops
  const history = [
    {
      role: 'user',
      content: 'I want to write a loop to print numbers from 1 to 5.'
    },
    {
      role: 'assistant',
      content: 'Great! You can use a while loop with a counter variable `i` that increments each turn.'
    },
    {
      role: 'user',
      content: 'I wrote it, but it just prints 1 infinitely.'
    },
    {
      role: 'assistant',
      content: 'That happens when your counter `i` is not incrementing inside the loop body, so `i <= 5` stays true forever.'
    }
  ];

  // Turn 3: Student asks a contextual question referencing previous turns ("How do I fix that increment?")
  console.log('--- Student asks contextual follow-up: "Where exactly should I put that increment so it stops at 5?" ---');
  const response = await aiTutorService.handleChat({
    prompt: 'Where exactly should I put that increment so it stops at 5?',
    currentCode: 'i = 1\nwhile i <= 5:\n    print(i)',
    language: 'Python',
    lesson: 'While Loops',
    task: 'Print numbers 1 to 5',
    history
  });

  console.log('\nTutor Reply (Demonstrating Memory of Previous Turns):');
  console.log(response.message);
  console.log('\nSuggested Next Step:', response.nextStep);
}

testConversationMemory().catch(console.error);
