const gemini = require('../../services/gemini.service');

const getExamDetails = async (examName) => {
  const prompt = `You are an Indian competitive exam expert. Provide comprehensive details for: "${examName}"

Return as JSON:
{
  "exam_name": "${examName}",
  "full_name": "Full official name",
  "conducting_body": "Organization name",
  "overview": "3-4 sentence overview",
  "eligibility": "Who can appear",
  "syllabus": [
    { "section": "Section Name", "topics": ["Topic 1", "Topic 2", "Topic 3"], "weightage": "X%" }
  ],
  "recommended_books": [
    { "title": "Book Name", "author": "Author Name", "for": "Which section/topic", "level": "beginner/intermediate/advanced" }
  ],
  "preparation_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "time_to_prepare": "X months recommended",
  "exam_pattern": { "total_marks": X, "duration": "X hours", "sections": X, "negative_marking": "Yes/No" },
  "important_dates_hint": "When the exam usually happens",
  "online_resources": ["Resource 1", "Resource 2"],
  "difficulty_level": "easy/moderate/hard/very_hard",
  "previous_year_cutoff_hint": "Approximate cutoff info"
}

Be accurate. Include popular Indian preparation books. Be specific to the Indian exam system.`;

  return gemini.generateJSON(prompt, { temperature: 0.4 });
};

module.exports = { getExamDetails };
