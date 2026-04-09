'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, Sparkles, ChevronLeft, ChevronRight, Rotate3d, CheckCircle, XCircle, Info } from 'lucide-react';
import { studyTableApi } from '@/lib/api/study-table.api';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export default function ArtifactView() {
  const router = useRouter();
  const { workspaceId, artifactId } = useParams();
  
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flashcard specific state
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confidence, setConfidence] = useState({}); // { [cardIndex]: 'easy' | 'hard' }

  // Quiz specific state
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchArtifact();
  }, [artifactId]);

  const fetchArtifact = async () => {
    try {
      const res = await studyTableApi.getArtifact(workspaceId, artifactId);
      setArtifact(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!artifact) return <div className="p-8 text-center text-slate-500 font-medium">Artifact not found</div>;

  const renderFlashcards = () => {
    if (!Array.isArray(artifact.content)) return <p>Invalid flashcard format.</p>;
    const card = artifact.content[activeCard];
    
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((activeCard + 1) / artifact.content.length) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {activeCard + 1} of {artifact.content.length}
          </span>
        </div>

        {/* 3D Card Container */}
        <div className="relative h-[400px] w-full perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCard}
              initial={{ opacity: 0, x: 50, rotateY: 0 }}
              animate={{ opacity: 1, x: 0, rotateY: flipped ? 180 : 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setFlipped(!flipped)}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full cursor-pointer relative"
            >
              {/* Front Side */}
              <div className={`absolute inset-0 w-full h-full bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col items-center justify-center p-12 backface-hidden ${flipped ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
                <div className="mb-6 w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Question</h3>
                <p className="text-2xl md:text-3xl font-black text-slate-800 text-center leading-tight tracking-tight">
                  {card.front || card.question}
                </p>
                <div className="mt-12 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <Rotate3d size={14} /> Click to flip
                </div>
              </div>

              {/* Back Side */}
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-12 flex flex-col items-center justify-center backface-hidden rotate-y-180 ${flipped ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                <h3 className="text-sm font-black text-indigo-200 uppercase tracking-[0.2em] mb-6">Definition / Answer</h3>
                <p className="text-2xl md:text-3xl font-black text-white text-center leading-tight tracking-tight">
                  {card.back || card.answer}
                </p>
                
                {/* Confidence Buttons (Mock SRS) */}
                <div className="mt-12 flex gap-3" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => { setConfidence({...confidence, [activeCard]: 'hard'}); if(activeCard < artifact.content.length - 1) setTimeout(() => { setActiveCard(a => a + 1); setFlipped(false); }, 300); }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-bold text-xs uppercase flex items-center gap-2 ring-1 ring-white/20 transition-all">
                    <XCircle size={14} className="text-rose-400" /> Need Review
                  </button>
                  <button 
                    onClick={() => { setConfidence({...confidence, [activeCard]: 'easy'}); if(activeCard < artifact.content.length - 1) setTimeout(() => { setActiveCard(a => a + 1); setFlipped(false); }, 300); }}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-bold text-xs uppercase flex items-center gap-2 ring-1 ring-white/40 transition-all">
                    <CheckCircle size={14} className="text-emerald-400" /> Mastered
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6">
          <button 
            disabled={activeCard === 0} 
            onClick={() => { setActiveCard(p=>p-1); setFlipped(false); }}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
             onClick={() => setFlipped(!flipped)}
             className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            Show {flipped ? 'Question' : 'Answer'}
          </button>

          <button 
            disabled={activeCard === artifact.content.length - 1} 
            onClick={() => { setActiveCard(p=>p+1); setFlipped(false); }}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm disabled:opacity-30 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!Array.isArray(artifact.content)) return <p>Invalid quiz format.</p>;
    
    let score = 0;
    if (submitted) {
      artifact.content.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) score++;
      });
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        {submitted && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-indigo-600 rounded-3xl p-8 text-white text-center shadow-2xl shadow-indigo-200"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award size={32} />
            </div>
            <h3 className="text-3xl font-black mb-1">Score: {score} / {artifact.content.length}</h3>
            <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-sm">
              {score === artifact.content.length ? 'Perfect Score! You are a master!' : 'Great effort! Keep reviewing the materials.'}
            </p>
          </motion.div>
        )}

        <div className="space-y-6">
          {artifact.content.map((q, qIndex) => (
            <motion.div 
              key={qIndex} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-6">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm shrink-0">{qIndex + 1}</span>
                <h4 className="text-xl font-extrabold text-slate-800 leading-tight">{q.question}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[qIndex] === opt;
                  const isCorrect = submitted && opt === q.correctAnswer;
                  const isWrong = submitted && isSelected && !isCorrect;

                  let border = 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50';
                  let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />;
                  
                  if (isSelected) {
                    border = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100';
                    icon = <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-white" /></div>;
                  }
                  if (isCorrect) {
                    border = 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100 text-emerald-900';
                    icon = <CheckCircle size={20} className="text-emerald-500 shrink-0" />;
                  }
                  if (isWrong) {
                    border = 'border-rose-500 bg-rose-50 ring-4 ring-rose-100 text-rose-900';
                    icon = <XCircle size={20} className="text-rose-500 shrink-0" />;
                  }

                  return (
                    <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${border} ${submitted ? 'pointer-events-none' : ''}`}>
                      <input 
                        type="radio" 
                        name={`q-${qIndex}`} 
                        className="hidden"
                        onChange={() => setAnswers({...answers, [qIndex]: opt})}
                        disabled={submitted}
                      />
                      {icon}
                      <span className="font-bold text-[15px]">{opt}</span>
                    </label>
                  );
                })}
              </div>
              
              {submitted && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 flex gap-3"
                >
                  <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block mb-1 uppercase tracking-wider text-[10px] font-black">Explanation</strong>
                    {q.explanation}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {!submitted && (
          <div className="sticky bottom-8 left-0 right-0 py-4 flex justify-center">
            <button 
              onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={Object.keys(answers).length < artifact.content.length}
              className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 shadow-2xl shadow-slate-300 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
            >
              Finish Quiz
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStudyGuide = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-16 shadow-xl prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:font-medium lg:prose-xl"
        >
          <ReactMarkdown>{artifact.content?.markdown || artifact.content}</ReactMarkdown>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
          <button onClick={() => router.push(`/ai-study-table/${workspaceId}`)} 
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-all group shrink-0"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-indigo-100">
                AI {artifact.type.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{artifact.title}</h1>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
            <FileText size={14} /> Created {new Date(artifact.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Content Renderers */}
        <div className="pb-20">
          {artifact.type === 'flashcard_set' && renderFlashcards()}
          {artifact.type === 'quiz' && renderQuiz()}
          {artifact.type === 'study_guide' && renderStudyGuide()}
        </div>

      </div>
    </div>
  );
}

// ─── Tailwind Styles ──────────────────────────────────────────
// Add this to your globals.css or keep it here for perspective
const cardStyles = `
.perspective-1000 {
  perspective: 1000px;
}
.backface-hidden {
  backface-visibility: hidden;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
`;

