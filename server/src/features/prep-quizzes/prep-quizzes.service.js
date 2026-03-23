const { ApiError } = require('../../utils/api-error');
const q = require('./prep-quizzes.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const getDaily = async (date) => {
  const quiz = await q.getDaily(date);
  if (!quiz) return { message: 'No daily quiz available for this date.', quiz: null };
  return quiz;
};
const getByExam = async (examId, query) => {
  const { page, limit, offset } = getPagination(query);
  const { quizzes, total } = await q.getByExam(examId, limit, offset);
  return { quizzes, pagination: getPaginationMeta(total, page, limit) };
};
const getByTopic = async (topic) => q.getByTopic(topic);
const getById = async (id) => { const qz = await q.getById(id); if (!qz) throw ApiError.notFound('Quiz not found.'); return qz; };
const create = async (data) => {
  if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) throw ApiError.badRequest('Questions required.');
  const id = await q.create(data);
  return q.getById(id);
};

const submit = async (userId, quizId, answers, timeTaken) => {
  const quiz = await q.getById(quizId);
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;

  let correct = 0, wrong = 0, skipped = 0;
  const results = questions.map((qn, i) => {
    const userAns = answers[i] !== undefined ? answers[i] : null;
    if (userAns === null || userAns === -1) { skipped++; return { ...qn, user_answer: null, is_correct: false, skipped: true }; }
    const isCorrect = userAns === qn.correct_answer;
    if (isCorrect) correct++; else wrong++;
    return { ...qn, user_answer: userAns, is_correct: isCorrect, skipped: false };
  });

  const attemptId = await q.submitAttempt({
    user_id: userId, quiz_id: quizId, answers, score: correct,
    total_questions: questions.length, correct_count: correct, wrong_count: wrong,
    skipped_count: skipped, time_taken_seconds: timeTaken,
  });

  return {
    attempt_id: attemptId, score: correct, total: questions.length,
    correct_count: correct, wrong_count: wrong, skipped_count: skipped,
    percentage: parseFloat(((correct/questions.length)*100).toFixed(1)),
    results,
  };
};

const getResults = async (userId, quizId) => {
  const attempt = await q.getAttempt(userId, quizId);
  if (!attempt) throw ApiError.notFound('No attempt found.');
  const quiz = await q.getById(quizId);
  return { attempt, quiz_title: quiz?.title };
};

const getLeaderboard = async (quizId) => q.getLeaderboard(quizId, 50);
const getDailyLeaderboard = async (date) => q.getDailyLeaderboard(date, 50);
const getUserStats = async (userId) => q.getUserStats(userId);

module.exports = { getDaily, getByExam, getByTopic, getById, create, submit, getResults, getLeaderboard, getDailyLeaderboard, getUserStats };
