'use client';
import { useState, useEffect, useCallback } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import {
  Bot, Play, CheckCircle2, Clock, AlertCircle, RefreshCw,
  ChevronRight, Star, ChevronDown, ChevronUp, Send,
} from 'lucide-react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

const SCORE_COLOR = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-500';

function InterviewSession({ interview, onComplete }) {
  const questions = JSON.parse(interview.questions || '[]');
  const answers = JSON.parse(interview.answers || '[]');
  const [currentQ, setCurrentQ] = useState(() => {
    const answeredIds = answers.map(a => a.question_id);
    return questions.findIndex(q => !answeredIds.includes(q.id));
  });
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const q = questions[currentQ];
  const progress = answers.length;
  const total = questions.length;
  const isDone = progress >= total;

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !q) return;
    setSubmitting(true);
    try {
      const res = await careerAPI.submitAnswer({
        interview_id: interview.id,
        question_id: q.id,
        answer_text: answerText,
      });
      const data = res.data?.data;
      setFeedback(data?.quick_feedback || null);
      setAnswerText('');
      if (data?.is_complete) {
        setCurrentQ(-1);
      } else if (data?.next_question) {
        const nextIdx = questions.findIndex(qq => qq.id === data.next_question.id);
        setTimeout(() => { setFeedback(null); setCurrentQ(nextIdx); }, 2000);
      }
    } catch (err) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await careerAPI.evaluateInterview({ interview_id: interview.id });
      setEvaluation(res.data?.data || null);
      onComplete();
    } catch {
      // ignore
    } finally {
      setEvaluating(false);
    }
  };

  if (evaluation) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Star size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Interview complete!</p>
              <p className="text-xs text-gray-500">{interview.target_role} at {interview.target_company || 'Company'}</p>
            </div>
            <p className={`ml-auto text-3xl font-bold ${SCORE_COLOR(evaluation.overall_score)}`}>
              {evaluation.overall_score}
            </p>
          </div>
          <p className="text-xs text-gray-600 italic">{evaluation.hiring_recommendation}</p>
        </div>

        {evaluation.strengths?.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-2">Strengths</p>
            <ul className="space-y-1">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <CheckCircle2 size={11} className="text-green-500 flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements?.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2">Areas to improve</p>
            <ul className="space-y-1">
              {evaluation.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <ChevronRight size={11} className="text-amber-500 flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">
            {isDone ? 'All questions answered!' : `Question ${progress + 1} of ${total}`}
          </p>
          <p className="text-xs text-gray-400">{interview.target_role}</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {feedback && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          <p className="font-semibold mb-1">Quick feedback:</p>
          {feedback}
        </div>
      )}

      {!isDone && q ? (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {progress + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{q.category}</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{q.difficulty}</span>
                {q.expected_duration_seconds && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock size={9} /> {Math.round(q.expected_duration_seconds / 60)} min
                  </span>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !answerText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              {submitting ? <><RefreshCw size={13} className="animate-spin" /> Submitting...</> : <><Send size={13} /> Submit answer</>}
            </button>
          </form>
        </div>
      ) : isDone && !evaluation ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
          <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-800 mb-1">All questions answered!</p>
          <p className="text-xs text-gray-500 mb-4">Click below to get your full AI evaluation with scores and feedback.</p>
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-1.5 mx-auto"
          >
            {evaluating ? <><RefreshCw size={13} className="animate-spin" /> Evaluating...</> : <><Star size={13} /> Get evaluation</>}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function InterviewPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const [activeInterview, setActiveInterview] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Form
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [showForm, setShowForm] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await careerAPI.getInterviewHistory();
      setHistory(res.data?.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setStarting(true);
    setError(null);
    try {
      const res = await careerAPI.startInterview({
        target_role: targetRole,
        target_company: targetCompany || undefined,
        interview_type: interviewType,
      });
      const interviewId = res.data?.data?.interview_id;
      if (interviewId) {
        const fullRes = await careerAPI.getInterview(interviewId);
        setActiveInterview(fullRes.data?.data || null);
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  const TYPES = ['technical', 'behavioral', 'hr', 'case_study'];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bot size={20} className="text-purple-600" /> Mock Interview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered interview practice with real-time feedback</p>
        </div>
        {!activeInterview && (
          <button
            onClick={() => setShowForm(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Play size={14} /> New interview
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600 border border-red-100">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {activeInterview ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              {activeInterview.interview_type} interview · {activeInterview.target_role}
            </p>
            <button
              onClick={() => { setActiveInterview(null); loadHistory(); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Exit
            </button>
          </div>
          <InterviewSession interview={activeInterview} onComplete={loadHistory} />
        </div>
      ) : (
        <>
          {showForm && (
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Bot size={16} className="text-purple-600" /> Set up your mock interview
              </h3>
              <form onSubmit={handleStart} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Target role *</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. SAP BTP Consultant"
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Company (optional)</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={e => setTargetCompany(e.target.value)}
                      placeholder="e.g. Deloitte"
                      className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Interview type</label>
                  <div className="flex gap-2 flex-wrap">
                    {TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInterviewType(t)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                          interviewType === t
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                        }`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={starting || !targetRole.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                  >
                    {starting ? <><RefreshCw size={13} className="animate-spin" /> Generating questions...</> : <><Play size={13} /> Start interview</>}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No interviews yet</p>
              <p className="text-xs text-gray-400 mb-4">Practice makes perfect. Start a mock interview now.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start first interview
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interview history</p>
              {history.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      item.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {item.overall_score || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.target_role}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.target_company || 'No company'} · {item.interview_type?.replace('_', ' ')} ·{' '}
                        {new Date(item.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                    {expandedId === item.id ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {expandedId === item.id && item.status === 'in_progress' && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <button
                        onClick={async () => {
                          const res = await careerAPI.getInterview(item.id);
                          setActiveInterview(res.data?.data || null);
                        }}
                        className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                      >
                        <Play size={11} /> Continue this interview →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
