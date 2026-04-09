'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import Link from 'next/link';
import { ClipboardList, Trophy, Clock, CheckCircle2, Plus, Loader2, BarChart2, ArrowRight } from 'lucide-react';

function MockTestCard({ mock }) {
  const hasTaken = mock.attempts_by_user > 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-gray-800 leading-snug">{mock.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              mock.difficulty_label === 'Hard' ? 'bg-red-50 text-red-700' :
              mock.difficulty_label === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
            }`}>{mock.difficulty_label}</span>
            <span className="text-[10px] text-gray-400">{mock.total_questions}Q · {mock.duration_minutes}min</span>
            <span className="text-[10px] text-gray-400">{mock.total_marks} marks</span>
          </div>
        </div>
        {hasTaken && mock.last_score !== null && (
          <div className="text-right flex-shrink-0">
            <p className="text-[14px] font-extrabold text-blue-600">{mock.last_score}</p>
            <p className="text-[9px] text-gray-400">/{mock.total_marks}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          {mock.attempt_count > 0 && <span>{mock.attempt_count.toLocaleString()} attempts</span>}
          {mock.avg_score > 0 && <span>Avg: {parseFloat(mock.avg_score).toFixed(0)}%</span>}
        </div>
        <div className="flex gap-2">
          {hasTaken && (
            <Link href={`/jee-command/mock-tests/${mock.id}/result`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-50 border text-gray-600 hover:bg-gray-100 transition-colors">
              <BarChart2 size={11} /> Analysis
            </Link>
          )}
          <Link href={`/jee-command/mock-tests/${mock.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            {hasTaken ? 'Retake' : 'Start'} <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MockTestsPage() {
  const { examType, selectedClass } = useJee();
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeType, setActiveType] = useState('full_mock');

  useEffect(() => {
    setLoading(true);
    jeeAPI.getMocks({ type: activeType, exam: examType })
      .then(r => setMocks(r.data?.data || []))
      .catch(() => setMocks([]))
      .finally(() => setLoading(false));
  }, [examType, activeType]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await jeeAPI.generateMock({ exam_type: examType, class_level: selectedClass, test_type: 'full_mock' });
      if (r.data?.data?.id) {
        const mR = await jeeAPI.getMocks({ type: activeType, exam: examType });
        setMocks(mR.data?.data || []);
      }
    } catch {}
    finally { setGenerating(false); }
  };

  const TEST_TYPES = [
    { id: 'full_mock',       label: 'Full Mock' },
    { id: 'chapter_test',    label: 'Chapter Test' },
    { id: 'topic_test',      label: 'Topic Test' },
    { id: 'daily_challenge', label: 'Daily Challenge' },
  ];

  return (
    <div>
      {/* NTA-style info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-3">
        <ClipboardList size={16} className="text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-blue-800">NTA-Exact Exam Interface</p>
          <p className="text-[11px] text-blue-600">Timer · Question palette · Section switching · Auto-save · Exactly like the real exam</p>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TEST_TYPES.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              activeType === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{t.label}</button>
        ))}
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-[12px] font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-60">
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Generate New
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border" />)}</div>
      ) : mocks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <ClipboardList size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No mock tests yet</p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">Generate a new mock test or add questions to the question bank first</p>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate Mock Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mocks.map(m => <MockTestCard key={m.id} mock={m} />)}
        </div>
      )}
    </div>
  );
}
