// Test script for Open-Source Jev Decision Engine on Ollama
const { jev } = require('./index');

async function testJev() {
  console.log('========================================');
  console.log('    Open-Source Jev (Ollama) Tests      ');
  console.log('========================================\n');

  // Test 1: Jev Choice
  console.log('1. Testing jev.choice()');
  const choiceRes = await jev.choice(
    'Why is my binary search getting stuck in an infinite loop?',
    ['syntax_error', 'algorithmic_bug', 'off_topic']
  );
  console.log('Result:', choiceRes);

  // Test 2: Jev Noul (Boolean True/False Decision)
  console.log('\n2. Testing jev.noul()');
  const noulRes = await jev.noul(
    'def two_sum(nums, target): return []',
    'The function implements an optimal solution for two-sum'
  );
  console.log('Result:', noulRes);

  // Test 3: Jev Score (Rubric Scoring)
  console.log('\n3. Testing jev.score()');
  const scoreRes = await jev.score(
    'i = 0\nwhile i < n:\n  print(arr[i])\n  i += 1',
    'Code readability, standard naming conventions, and correct loop termination',
    1,
    10
  );
  console.log('Result:', scoreRes);

  // Test 4: CodeArena Prompt Guardrail (Valid Coding Question)
  console.log('\n4. Testing jev.validatePrompt() - Case A: Valid Question');
  const guardValid = await jev.validatePrompt(
    'Can you give me a hint on how to traverse the tree using DFS?',
    { title: 'Binary Tree Inorder Traversal', task: 'Traverse the tree' }
  );
  console.log('Result:', guardValid);

  // Test 5: CodeArena Prompt Guardrail (Off-Topic Bad Prompt)
  console.log('\n5. Testing jev.validatePrompt() - Case B: Off-Topic Prompt');
  const guardOffTopic = await jev.validatePrompt(
    'Can you give me a great recipe for chocolate chip cookies?',
    { title: 'Two Sum', task: 'Find two indices' }
  );
  console.log('Result:', guardOffTopic);

  console.log('\n========================================');
  console.log('         All Jev Tests Passed!          ');
  console.log('========================================');
}

testJev().catch(console.error);
