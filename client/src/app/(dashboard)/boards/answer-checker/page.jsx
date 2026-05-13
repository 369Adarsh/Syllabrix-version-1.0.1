'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_SUBJECTS } from '@/data/board-syllabus';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Sparkles, CheckCircle2, XCircle,
  Loader2, Camera, FileImage, AlertTriangle, Trophy,
  Target, TrendingUp, TrendingDown, RefreshCw, Info
} from 'lucide-react';

// ── Result display ────────────────────────────────────────────────────────────

function ResultCard({ result }) {
  if (!result) return null;
  const pct = result.percentage || (result.totalPossible > 0 ? Math.round((result.totalAwarded / result.totalPossible) * 100) : 0);

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className={`rounded-2xl border p-6 text-center space-y-3 ${pct >= 70 ? 'bg-emerald-50 border-emerald-200' : pct >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-[32px] font-black border-2 ${pct >= 70 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : pct >= 40 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
          {pct}%
        </div>
        <div>
          <p className="text-[22px] font-extrabold text-gray-800">{result.totalAwarded} / {result.totalPossible} marks</p>
          <p className="text-[13px] text-gray-500 mt-0.5">{pct >= 70 ? '🎉 Excellent performance!' : pct >= 40 ? '📚 Good effort — room to improve' : '💪 Keep practicing — review the topics'}</p>
        </div>
        <p className="text-[13px] text-gray-600 max-w-md mx-auto">{result.overallFeedback}</p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {result.strengthAreas?.length > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-emerald-600" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Strengths</p>
            </div>
            <ul className="space-y-1.5">
              {result.strengthAreas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.improvementAreas?.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={15} className="text-amber-600" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Areas to Improve</p>
            </div>
            <ul className="space-y-1.5">
              {result.improvementAreas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Per-question breakdown */}
      {result.evaluation?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Question-by-Question Breakdown</p>
          </div>
          <div className="divide-y divide-gray-50">
            {result.evaluation.map((ev, i) => {
              const qPct = ev.maxMarks > 0 ? Math.round((ev.marksAwarded / ev.maxMarks) * 100) : 0;
              return (
                <div key={i} className="px-5 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-500">Q{ev.questionNo}</p>
                      {ev.questionText && <p className="text-[13px] text-gray-700 leading-snug mt-0.5">{ev.questionText}</p>}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[12px] font-black shrink-0 ${qPct >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : qPct >= 40 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {ev.marksAwarded}/{ev.maxMarks}
                    </div>
                  </div>
                  {ev.studentAnswer && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student wrote:</p>
                      <p className="text-[12px] text-gray-600 leading-snug">{ev.studentAnswer}</p>
                    </div>
                  )}
                  {ev.feedback && (
                    <p className="text-[12px] text-gray-600 bg-blue-50 border border-blue-100 p-2.5 rounded-xl leading-snug">
                      <span className="font-semibold text-blue-700">Feedback: </span>{ev.feedback}
                    </p>
                  )}
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${qPct >= 70 ? 'bg-emerald-500' : qPct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${qPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnswerCheckerPage() {
  const { user } = useAuth();
  const classLevel = parseInt(user?.profile?.class_name || user?.profile?.class_level || '10') || 10;
  const validClass = classLevel <= 9 ? 9 : 10;
  const board = user?.profile?.board || 'CBSE';

  const fileRef = useRef(null);
  const [images, setImages]         = useState([]);   // [{dataUrl, file, name}]
  const [subject, setSubject]       = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [dragOver, setDragOver]     = useState(false);

  const addFiles = (files) => {
    const newImgs = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { dataUrl: e.target.result, name: file.name, type: file.type }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => setImages(p => p.filter((_, idx) => idx !== i));

  const check = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Use first image (or combine multiple — for now use first)
      const img = images[0];
      const base64 = img.dataUrl.split(',')[1];
      const mime = img.type.startsWith('image/') ? img.type : 'image/jpeg';

      const res = await apiClient.post('/boards/answer/check', {
        imageBase64: base64,
        imageMime: mime,
        subject: BOARD_SUBJECTS.find(s => s.slug === subject)?.name || subject || 'General',
        classLevel: validClass,
        board,
      });
      setResult(res.data.result);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to check answer sheet. Try a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImages([]); setResult(null); setError(''); };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/boards" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[18px] font-extrabold text-gray-800 flex items-center gap-2">
            <Camera size={20} className="text-rose-500" /> Answer Sheet Checker
          </h1>
          <p className="text-[11px] text-gray-400">{board} Class {validClass} · Upload your written answer sheet · Get AI marks + feedback</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-[12px] text-blue-800 space-y-1">
          <p className="font-bold">How it works</p>
          <ol className="space-y-0.5 list-decimal list-inside text-blue-700">
            <li>Write answers to your test/practice questions on paper</li>
            <li>Take a clear photo of each page</li>
            <li>Upload the photo here — AI reads your handwriting and evaluates</li>
            <li>Get marks per question + detailed feedback</li>
          </ol>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4">
          {/* Subject selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Subject (optional — helps AI evaluate better)</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSubject('')}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all ${!subject ? 'bg-gray-700 text-white border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                Auto-detect
              </button>
              {BOARD_SUBJECTS.map(s => (
                <button key={s.slug} onClick={() => setSubject(s.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all ${subject === s.slug ? `${s.color} text-white border-transparent` : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Upload Answer Sheet Photos</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-all ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dragOver ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                <Upload size={24} className={dragOver ? 'text-indigo-500' : 'text-gray-400'} />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700">Drop photos here or click to upload</p>
                <p className="text-[12px] text-gray-400 mt-0.5">JPG, PNG, WEBP · Take a clear, well-lit photo of your answer sheet</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => addFiles(e.target.files)} />
            </div>

            {/* Camera button (mobile) */}
            <button onClick={() => { if (fileRef.current) { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click(); }}}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[13px] font-semibold text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-all">
              <Camera size={15} /> Take a photo with camera
            </button>

            {/* Preview images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[3/4]">
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all">
                      <XCircle size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-[9px] text-white/80 truncate">{img.name}</p>
                    </div>
                  </div>
                ))}
                {/* Add more */}
                <button onClick={() => fileRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-gray-200 aspect-[3/4] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <Upload size={18} />
                  <span className="text-[11px] font-semibold">Add page</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button onClick={check} disabled={images.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> AI is reading your handwriting…</>
              : <><Sparkles size={16} /> Check My Answer Sheet</>}
          </button>

          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center space-y-3">
              <Loader2 size={28} className="animate-spin text-rose-400 mx-auto" />
              <p className="text-[14px] font-semibold text-gray-700">AI is reading and evaluating your answers…</p>
              <p className="text-[12px] text-gray-400">This may take 20-40 seconds depending on the number of pages</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={reset} className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw size={13} /> Check another sheet
            </button>
          </div>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
