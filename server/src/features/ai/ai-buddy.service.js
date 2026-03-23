const ai = require('../../services/ai.service');

/**
 * AI Buddy system prompt — the personality of the buddy
 */
const BUDDY_SYSTEM_PROMPT = `You are **Syllabrix AI Buddy** — a brilliant, warm, and motivating learning companion for Indian students (ages 10-25+).

Your personality:
- You're like a super-smart older sibling who genuinely cares
- You explain hard things simply with relatable Indian examples
- You celebrate effort ("Great question!" "You're thinking like a scientist!")
- You're honest when you don't know something
- You adapt your language to the student's level

Your capabilities:
- Academic doubts (any subject, any class 6-12 and competitive exams)
- Career guidance (stream selection, college advice, profession info)
- Exam preparation strategy (JEE, NEET, UPSC, boards, etc.)
- Study tips and motivation
- Current affairs discussion
- General knowledge and curiosity questions

Rules:
- Keep responses concise (under 250 words unless a detailed explanation is needed)
- Use step-by-step explanations for problems
- Include formulas when relevant (written in plain text)
- Give Indian context examples (INR, Indian cities, CBSE/ICSE, Indian exams)
- If asked about something harmful or inappropriate, gently redirect to learning
- End longer explanations with a quick revision point or fun fact
- Use simple markdown: **bold** for key terms, numbered lists for steps
- Never start responses with "Great question!" every time — vary your openings`;

/**
 * Detect the intent of a message to adjust context
 */
const detectIntent = (message) => {
  const lower = message.toLowerCase();
  if (/pcm|pcb|commerce|arts|stream|career|after 10|after 12|choose|profession|salary|job|engineer|doctor|lawyer/.test(lower)) return 'career';
  if (/jee|neet|upsc|exam|prepare|syllabus|strategy|mock test|previous year|cut.?off|rank/.test(lower)) return 'exam';
  if (/current affairs|news|today|happening|election|budget|g20/.test(lower)) return 'current_affairs';
  if (/motivat|stress|anxiety|can't study|focus|tired|bored|distract|procrastinat/.test(lower)) return 'motivation';
  if (/solve|calculate|find.*value|simplify|prove|equation|formula|what is \d/.test(lower)) return 'problem_solving';
  return 'general';
};

/**
 * Build context enrichment based on intent
 */
const getIntentContext = (intent) => {
  switch (intent) {
    case 'career':
      return '\n\nThe student is asking about career/stream selection. Give specific, actionable Indian career guidance. Mention real colleges, exams, salary ranges in INR, and growth paths.';
    case 'exam':
      return '\n\nThe student is asking about exam preparation. Give specific strategy advice — study hours, book recommendations, topic priority, time management. Be practical and motivating.';
    case 'current_affairs':
      return '\n\nThe student wants to know about current affairs. Give factual, educational responses. Connect to exam relevance (UPSC, SSC, banking) where appropriate.';
    case 'motivation':
      return '\n\nThe student seems stressed or unmotivated. Be empathetic first, then give practical tips. Share a brief motivational insight. Suggest a study technique like Pomodoro or active recall.';
    case 'problem_solving':
      return '\n\nThe student wants to solve a problem. Show the complete step-by-step solution. State the formula first, then substitute values, then compute. Double-check the answer.';
    default:
      return '';
  }
};

/**
 * Main buddy chat function — smart routing with multi-provider fallback
 */
const buddyChat = async (history, message, options = {}) => {
  const { class_level, board, subject } = options;

  const intent = detectIntent(message);
  let systemPrompt = BUDDY_SYSTEM_PROMPT;

  // Add student context
  if (class_level || board || subject) {
    systemPrompt += `\n\nStudent context: ${class_level ? `Class ${class_level}` : ''} ${board ? `(${board} board)` : ''} ${subject ? `studying ${subject}` : ''}`.trim();
  }

  // Add intent-specific context
  systemPrompt += getIntentContext(intent);

  const reply = await ai.chat(history, message, systemPrompt);
  return { reply, intent };
};

/**
 * Generate a session title from the first message
 */
const generateTitle = (message) => {
  const clean = message.trim();
  if (clean.length <= 60) return clean;
  // Try to cut at word boundary
  const truncated = clean.slice(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

module.exports = { buddyChat, generateTitle, detectIntent };
