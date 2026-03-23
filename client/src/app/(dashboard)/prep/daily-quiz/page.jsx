'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { prepAPI } from '@/lib/api/prep.api';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Brain, CheckCircle, XCircle, Trophy, ArrowLeft, Loader2, Sparkles,
  Zap, Target, Clock, BookOpen, ArrowRight, Calendar, Flame, Newspaper
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══ QUIZ RENDERER (shared) ═══
function QuizRenderer({ quiz, questions: rawQuestions, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = rawQuestions || (quiz?.questions ? (typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions) : []);
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    if (!quiz?.id) { toast.error('Quiz not saved yet'); return; }
    const ansArray = questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
    setSubmitting(true);
    try {
      const res = await prepAPI.submitQuiz(quiz.id, { answers: ansArray });
      setResult(res.data?.data);
      toast.success(`Score: ${res.data?.data?.correct_count}/${res.data?.data?.total}`);
      onComplete?.(res.data?.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  // If no quiz ID but we have questions (generated topic quiz), score locally
  const handleLocalScore = () => {
    let correct = 0;
    const results = questions.map((q, i) => {
      const isCorrect = answers[i] === q.correct_answer;
      if (isCorrect) correct++;
      return { ...q, user_answer: answers[i], is_correct: isCorrect };
    });
    setResult({ correct_count: correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100), results });
  };

  if (questions.length === 0) return <p className="text-center text-gray-400 py-8">No questions available</p>;

  return (
    <div className="space-y-4">
      {!result ? (
        <>
          {/* Progress */}
          <div className="bg-white rounded-full border border-gray-100 h-2 overflow-hidden shadow-sm">
            <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>

          {/* Questions */}
          {questions.map((q, qi) => (
            <div key={qi} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${answers[qi] !== undefined ? 'border-purple-200 bg-purple-50/20' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{qi + 1}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-[14px] leading-relaxed">{q.question}</p>
                  {q.category && <span className="text-[10px] text-gray-400 capitalize mt-0.5 inline-block">{q.category} · {q.difficulty}</span>}
                </div>
              </div>
              <div className="space-y-2 ml-10">
                {(q.options || []).map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      answers[qi] === oi ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2.5 ${
                      answers[qi] === oi ? 'bg-white/20 text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}>{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button onClick={quiz?.id ? handleSubmit : handleLocalScore} disabled={submitting || answeredCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-200/40 hover:from-purple-700 hover:to-fuchsia-700 transition-all active:scale-[0.98] disabled:opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Submit ({answeredCount}/{questions.length})
          </button>
        </>
      ) : (
        <>
          {/* Score card */}
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200/50 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200/40">
              <Trophy size={36} className="text-white" />
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{result.correct_count}<span className="text-gray-400 text-2xl">/{result.total}</span></div>
            <p className="text-lg font-bold text-purple-600 mb-1">{result.percentage}%</p>
            <p className="text-sm text-gray-500">
              {result.percentage >= 80 ? '🎉 Excellent!' : result.percentage >= 50 ? '💪 Good effort!' : '📚 Keep practicing!'}
            </p>
          </div>

          {/* Review */}
          <div className="space-y-3">
            {(result.results || []).map((r, i) => (
              <div key={i} className={`bg-white border rounded-2xl p-4 ${r.is_correct ? 'border-emerald-200' : 'border-red-200'}`}>
                <div className="flex items-start gap-2.5 mb-2">
                  {r.is_correct ? <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm font-semibold text-gray-800">{r.question}</p>
                </div>
                <div className="ml-7 space-y-1">
                  {!r.is_correct && <p className="text-xs text-red-500">Your answer: {r.options?.[r.user_answer] || 'Not answered'}</p>}
                  <p className="text-xs text-emerald-600 font-medium">✓ {r.options?.[r.correct_answer]}</p>
                  {r.explanation && <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded-lg px-3 py-2">{r.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function DailyQuizPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('daily');

  // Daily quiz state
  const [dailyQuiz, setDailyQuiz] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [autoGenLoading, setAutoGenLoading] = useState(false);

  // Topic quiz state
  const [topicInput, setTopicInput] = useState('');
  const [topicQuiz, setTopicQuiz] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('mixed');
  const [qCount, setQCount] = useState(10);

  // Weekly challenge
  const [weeklyQuiz, setWeeklyQuiz] = useState(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // Load daily quiz
  useEffect(() => {
    prepAPI.getDailyQuiz()
      .then(r => setDailyQuiz(r.data?.data))
      .catch(() => {})
      .finally(() => setDailyLoading(false));
  }, []);

  const autoGenerateDaily = async () => {
    setAutoGenLoading(true);
    try {
      const res = await aiAPI.autoGenerateDailyQuiz(new Date().toISOString().slice(0, 10));
      const data = res.data?.data || res.data;
      toast.success(`Quiz created with ${data.question_count || 10} questions!`);
      // Reload
      const reload = await prepAPI.getDailyQuiz();
      setDailyQuiz(reload.data?.data);
    } catch (e) { toast.error('Could not generate quiz'); }
    finally { setAutoGenLoading(false); }
  };

  const generateTopicQuiz = async () => {
    if (!topicInput.trim()) { toast.error('Enter a topic'); return; }
    setTopicLoading(true); setTopicQuiz(null);
    try {
      const res = await aiAPI.generateTopicQuiz(topicInput.trim(), { difficulty, count: qCount });
      const data = res.data?.data || res.data;
      setTopicQuiz(data);
    } catch { toast.error('Could not generate quiz'); }
    finally { setTopicLoading(false); }
  };

  const generateWeekly = async () => {
    setWeeklyLoading(true); setWeeklyQuiz(null);
    try {
      const res = await aiAPI.generateWeeklyChallenge();
      const data = res.data?.data || res.data;
      toast.success('Weekly challenge created!');
      // Load it via prep API
      if (data.id) {
        const q = await prepAPI.getQuizResults(data.id).catch(() => null);
        // Just use the generated data
      }
      setWeeklyQuiz(data);
    } catch { toast.error('Could not generate'); }
    finally { setWeeklyLoading(false); }
  };

  const dailyQuestions = dailyQuiz?.questions ? (typeof dailyQuiz.questions === 'string' ? JSON.parse(dailyQuiz.questions) : dailyQuiz.questions) : [];
  const topicQuestions = topicQuiz?.questions || [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-600 p-5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/prep" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><ArrowLeft size={16} className="text-white" /></Link>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Brain size={20} className="text-purple-200" /></div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-white">Quiz Hub</h1>
            <p className="text-purple-200/70 text-xs">AI-powered quizzes — daily, topic-based, and weekly challenges</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'daily', l: 'Daily Quiz', icon: Calendar },
          { k: 'topic', l: 'Topic Quiz', icon: Target },
          { k: 'weekly', l: 'Weekly Challenge', icon: Flame },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            <t.icon size={13} /> {t.l}
          </button>
        ))}
      </div>

      {/* ═══ DAILY TAB ═══ */}
      {tab === 'daily' && (
        <>
          {dailyLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center"><Loader2 size={28} className="animate-spin text-purple-500 mx-auto" /></div>
          ) : !dailyQuiz || dailyQuestions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4"><Brain size={28} className="text-purple-400" /></div>
              <h2 className="font-bold text-gray-700 mb-2">No Daily Quiz Yet</h2>
              <p className="text-sm text-gray-400 mb-5">AI can generate one from today&apos;s current affairs.</p>
              <button onClick={autoGenerateDaily} disabled={autoGenLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md transition-all disabled:opacity-50">
                {autoGenLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Auto-Generate from News
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-500" />
                  <span className="text-sm font-semibold text-gray-700">{dailyQuiz.title || 'Daily Quiz'}</span>
                  <span className="text-[10px] text-gray-400">{dailyQuestions.length} questions</span>
                </div>
                <span className="text-[10px] text-gray-400">{dailyQuiz.difficulty || 'Mixed'}</span>
              </div>
              <QuizRenderer quiz={dailyQuiz} />
            </>
          )}
        </>
      )}

      {/* ═══ TOPIC TAB ═══ */}
      {tab === 'topic' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Target size={16} className="text-indigo-500" /> Generate a Topic Quiz</h3>
            <input value={topicInput} onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateTopicQuiz()}
              placeholder="Enter any topic... (e.g. Photosynthesis, Indian Constitution, Calculus)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Difficulty</label>
                <div className="flex gap-1">
                  {['easy', 'medium', 'hard', 'mixed'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-semibold capitalize transition-all ${difficulty === d ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="w-24">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Questions</label>
                <select value={qCount} onChange={e => setQCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all">
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Photosynthesis', 'Indian Constitution', 'Periodic Table', 'World War 2', 'Trigonometry', 'Current Affairs', 'Indian Economy', 'Computer Science'].map(t => (
                <button key={t} onClick={() => { setTopicInput(t); }}
                  className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all">{t}</button>
              ))}
            </div>
            <button onClick={generateTopicQuiz} disabled={topicLoading || !topicInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 transition-all disabled:opacity-50">
              {topicLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Quiz
            </button>
          </div>

          {topicLoading && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse"><Brain size={24} className="text-white" /></div>
              <p className="font-bold text-gray-700">AI is creating your quiz...</p>
              <p className="text-sm text-gray-400 mt-1">Generating {qCount} questions on &ldquo;{topicInput}&rdquo;</p>
            </div>
          )}

          {topicQuiz && topicQuestions.length > 0 && !topicLoading && (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between shadow-sm">
                <span className="text-sm font-semibold text-gray-700">{topicQuiz.title || `Quiz: ${topicInput}`}</span>
                <span className="text-[10px] text-gray-400">{topicQuestions.length} questions · {difficulty}</span>
              </div>
              <QuizRenderer quiz={topicQuiz} questions={topicQuestions} />
            </>
          )}
        </>
      )}

      {/* ═══ WEEKLY TAB ═══ */}
      {tab === 'weekly' && (
        <>
          {!weeklyQuiz ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4"><Flame size={28} className="text-amber-500" /></div>
              <h2 className="font-bold text-gray-700 mb-2">Weekly Challenge</h2>
              <p className="text-sm text-gray-400 mb-5">20 tough questions covering the entire week&apos;s current affairs. 20-minute time limit.</p>
              <button onClick={generateWeekly} disabled={weeklyLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 transition-all disabled:opacity-50">
                {weeklyLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Generate Weekly Challenge
              </button>
            </div>
          ) : weeklyLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><Loader2 size={28} className="animate-spin text-amber-500 mx-auto" /></div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Flame size={16} className="text-amber-500" /><span className="text-sm font-bold text-gray-700">{weeklyQuiz.title || 'Weekly Challenge'}</span></div>
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold"><Clock size={10} /> 20 min</span>
              </div>
              <QuizRenderer quiz={weeklyQuiz} />
            </>
          )}
        </>
      )}

      {/* Bottom link */}
      <div className="flex justify-center gap-4 pb-4">
        <Link href="/prep/my-stats" className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold flex items-center gap-1"><Trophy size={12} /> My Stats</Link>
        <Link href="/prep/current-affairs" className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"><Newspaper size={12} /> Current Affairs</Link>
      </div>
    </div>
  );
}
