// Cleans and parses JSON responses from model output.

function parseJson(text) {
  if (typeof text !== 'string') {
    throw new Error('parseJson expects a string input.');
  }

  // Strip markdown code fences (```json, ```, etc.)
  let cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '');

  // Extract from the first { to the last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error(`No JSON object found in model output: "${text.slice(0, 120)}..."`);
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1).trim();

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Failed to parse extracted JSON: ${err.message}. Raw extracted text: "${jsonString}"`);
  }
}

module.exports = parseJson;
