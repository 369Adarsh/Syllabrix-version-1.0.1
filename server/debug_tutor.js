
require('dotenv').config({ path: './.env.development' });
const { getGeminiModel } = require('./src/utils/gemini-utils');

const JEE_SYSTEM = `You are an elite JEE expert tutor (IIT graduate, 10+ years teaching). The student is preparing for JEE Main + Advanced.

Rules:
- Show DETAILED step-by-step solutions — never skip steps
- Use LaTeX for ALL math: $F = ma$ inline, $$\\int_0^\\pi \\sin x\\,dx = 2$$ block
- Connect every concept to JEE exam patterns
- Highlight common mistakes in bold
- Mention if the topic appeared in JEE Main/Advanced and which year
- Format in clean Markdown with headings
- Give shortcuts and tricks that save time in exam`;

async function debugTutor() {
  console.log("--- Debugging AI Tutor 'solveDoubt' ---");
  try {
    const model = getGeminiModel();
    const questionText = 'Explain "Motion in one, two and three dimensions" (Physics, Level 1)';
    const subject = 'Physics';
    const chapter = 'Motion';

    const parts = [];
    parts.push({ text: `${JEE_SYSTEM}\n\nSubject: ${subject || 'Auto-detect'}\nChapter: ${chapter || 'Auto-detect'}\n\nStudent's doubt:\n${questionText}\n\n---\nProvide a COMPLETE response with:\n\n## Understanding the Problem\n[Identify what is given and what is asked]\n\n## Key Concept\n[State the principle/formula needed]\n\n## Step-by-Step Solution\n[Every step with LaTeX formulas]\n\n## Final Answer\n[Boxed answer with units]\n\n## Common Mistake to Avoid\n[What students typically get wrong here]\n\n## JEE Tip\n[Shortcut or trick for this type of question]` });

    console.log("Calling Gemini API...");
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const text = result.response.text();
    console.log("✓ SUCCESS! AI Response:");
    console.log(text.slice(0, 500) + "...");
  } catch (err) {
    console.error("✗ FAILED:", err.message);
    if (err.response) {
       console.error("Safety Data:", JSON.stringify(err.response.promptFeedback, null, 2));
    }
  }
}

debugTutor();
