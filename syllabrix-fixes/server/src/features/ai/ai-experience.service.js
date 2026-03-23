const gemini = require('../../services/gemini.service');

/**
 * Generate rich learning resources for an Experience Lab task
 * This is what transforms empty tasks into real learning experiences
 */
const generateTaskResources = async (taskTitle, taskDescription, profession, level) => {
  const prompt = `You are an expert mentor for someone learning to be a ${profession || 'professional'}.
A student at the ${level || 'Beginner'} level has this task:

Task: "${taskTitle}"
Description: "${taskDescription}"
Profession: ${profession}
Level: ${level || 'Beginner'}

Generate comprehensive learning resources to help them ACTUALLY complete this task.

Return as JSON:
{
  "steps": [
    {
      "title": "Step title",
      "description": "Clear explanation of what to do in this step (2-3 sentences)",
      "tip": "A practical pro tip for this step (optional, can be null)"
    }
  ],
  "youtube_videos": [
    {
      "title": "Video title that teaches this skill",
      "url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
      "video_id": "REAL_VIDEO_ID",
      "channel": "Channel name",
      "duration": "10 min"
    }
  ],
  "notes": {
    "content": "Detailed explanation of the concepts needed for this task. Include: what this skill is about, why it matters, core principles to understand. Write 200-300 words in clear simple language.",
    "key_terms": ["Term 1", "Term 2", "Term 3", "Term 4"]
  },
  "tools_needed": [
    {
      "name": "Tool/Software name",
      "description": "What it's used for",
      "link": "https://download-or-website-link.com (if applicable, otherwise null)"
    }
  ],
  "examples": [
    {
      "title": "Example project/work title",
      "description": "What this example demonstrates and how it relates to the task"
    }
  ],
  "pro_tips": [
    "Real-world tip from experienced professionals",
    "Common mistake to avoid",
    "Shortcut or best practice"
  ]
}

Rules:
- Generate 4-7 clear, actionable steps
- Suggest 2-4 REAL YouTube videos (use popular educational channels like Skillshare promos on YT, freeCodeCamp, The Futur, Architectural Digest, etc. based on the profession)
- Notes should be genuinely educational, not filler text
- Include real tools/software that professionals use (many are free)
- Examples should be inspiring but achievable for a ${level} student
- Pro tips should come from real industry knowledge
- Make everything practical and hands-on — no theoretical fluff
- This should feel like having a real mentor guide you`;

  return gemini.generateJSON(prompt, { temperature: 0.6 });
};

module.exports = { generateTaskResources };
