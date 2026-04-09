/**
 * verify_json_repair.js
 * Test script for the updated repairJSON logic.
 */

// Simulation of the repairJSON function from ai.service.js
const repairJSON = (text) => {
  let cleaned = text.trim();
  
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  let start = -1;
  let last = -1;

  // The logic that was updated:
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    last = lastBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
    last = lastBracket;
  }

  if (start !== -1 && last > start) {
    cleaned = cleaned.slice(start, last + 1);
  }

  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  
  return cleaned;
};

const testCases = [
  {
    name: "Standard Markdown Array",
    input: "Here are the results:\n```json\n[\n  {\"id\": 1}\n]\n```\nHope this helps!",
    expected: '[{"id": 1}]'
  },
  {
    name: "Array with Conversational Preamble (No Markdown)",
    input: "Sure thing! Here is the array: [{\"name\": \"test\"}, {\"name\": \"demo\"}] let me know if you need more.",
    expected: '[{"name": "test"}, {"name": "demo"}]'
  },
  {
    name: "Object with Conversational Preamble",
    input: "Result: {\"status\": \"ok\"} - end of response",
    expected: '{"status": "ok"}'
  },
  {
    name: "Array with Trailing Comma",
    input: "[{\"a\":1},]",
    expected: '[{"a":1}]'
  }
];

testCases.forEach(tc => {
  const result = repairJSON(tc.input);
  const status = result === tc.expected ? "PASS" : "FAIL";
  console.log(`[${status}] ${tc.name}`);
  if (status === "FAIL") {
    console.log(`   Input:    ${tc.input.replace(/\n/g, '\\n')}`);
    console.log(`   Expected: ${tc.expected}`);
    console.log(`   Result:   ${result}`);
  }
});
