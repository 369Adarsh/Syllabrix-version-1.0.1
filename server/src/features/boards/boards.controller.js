const boardsService = require('./boards.service');

exports.generateStudyNotes = async (req, res) => {
  try {
    const { subject, chapter, classLevel, board } = req.body;
    if (!subject || !chapter) return res.status(400).json({ error: 'subject and chapter required' });
    const data = await boardsService.generateStudyNotes({ subject, chapter, classLevel, board });
    res.json({ success: true, data });
  } catch (e) {
    console.error('[Boards] generateStudyNotes error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

exports.generatePracticeQuestions = async (req, res) => {
  try {
    const { subject, chapter, classLevel, board, questionType, count, difficulty } = req.body;
    if (!subject || !chapter || !questionType) {
      return res.status(400).json({ error: 'subject, chapter, and questionType required' });
    }
    const questions = await boardsService.generatePracticeQuestions({ subject, chapter, classLevel, board, questionType, count: Math.min(count || 5, 20), difficulty });
    res.json({ success: true, questions });
  } catch (e) {
    console.error('[Boards] generatePracticeQuestions error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

exports.generateTestPaper = async (req, res) => {
  try {
    const { classLevel, board, subject, chapters, duration, totalMarks, questionConfig } = req.body;
    if (!subject || !chapters?.length) {
      return res.status(400).json({ error: 'subject and chapters required' });
    }
    const paper = await boardsService.generateTestPaper({ classLevel, board, subject, chapters, duration, totalMarks, questionConfig });
    res.json({ success: true, paper });
  } catch (e) {
    console.error('[Boards] generateTestPaper error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

exports.checkAnswerSheet = async (req, res) => {
  try {
    const { imageBase64, imageMime, questionPaper, subject, classLevel, board } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    const result = await boardsService.checkAnswerSheet({ imageBase64, imageMime, questionPaper, subject, classLevel, board });
    res.json({ success: true, result });
  } catch (e) {
    console.error('[Boards] checkAnswerSheet error:', e.message);
    res.status(500).json({ error: e.message });
  }
};
