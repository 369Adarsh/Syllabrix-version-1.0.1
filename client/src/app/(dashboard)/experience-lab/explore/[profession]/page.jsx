'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { aiAPI } from '@/lib/api/ai.api';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Sparkles, Star, TrendingUp, Heart, Clock, Zap, Trophy, MessageSquare, Shield, Mail, Play, ChevronRight, RefreshCw, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfessionExplorePage() {
  const { profession } = useParams();
  const profName = decodeURIComponent(profession);
  const [data, setData] = useState(null);
  const [comms, setComms] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [loadingComms, setLoadingComms] = useState(false);

  useEffect(() => {
    aiAPI.exploreProfession(profName).then(r => setData(r.data.data)).catch(e => toast.error('Loading...')).finally(() => setLoading(false));
  }, [profName]);

  const loadChallenge = async () => {
    setLoadingChallenge(true);
    try { const r = await aiAPI.generateChallenge(profName, activeLevel); setChallenge(r.data.data); }
    catch(e) { toast.error('Try again'); } finally { setLoadingChallenge(false); }
  };

  const loadComms = async () => {
    if (comms) return;
    setLoadingComms(true);
    try { const r = await aiAPI.getProfessionalComms(profName); setComms(r.data.data); }
    catch(e) { toast.error('Try again'); } finally { setLoadingComms(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <Sparkles size={32} className="text-purple-500 mx-auto mb-3 animate-pulse" />
      <p className="font-heading font-bold text-gray-700">AI is preparing {profName}...</p>
      <p className="text-sm text-gray-400 mt-1">Loading levels, skills, ethics & more</p>
      <Spinner className="mt-4" />
    </div>
  );

  if (!data) return <p className="text-center py-16 text-gray-400">Could not load profession. Try again.</p>;
  const d = data;
  const levels = d.levels || {};
  const ps = d.professional_skills || {};

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center gap-1 mb-2"><Sparkles size={14} /><span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">AI Generated</span></div>
          <h1 className="font-heading text-2xl font-bold">{d.name}</h1>
          <p className="text-purple-200 text-sm mt-1 italic">"{d.tagline}"</p>
          <div className="flex gap-3 mt-3">
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center"><div className="text-lg font-bold">{d.fun_rating}/5</div><div className="text-[9px] text-purple-200">Fun</div></div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center"><div className="text-lg font-bold">{d.difficulty_rating}/5</div><div className="text-[9px] text-purple-200">Difficulty</div></div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center"><div className="text-lg font-bold capitalize">{d.demand}</div><div className="text-[9px] text-purple-200">Demand</div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-blue-100/60 rounded-xl p-1 overflow-x-auto">
        {[{k:'overview',l:'Overview'},{k:'levels',l:'Levels & Tasks'},{k:'ethics',l:'Ethics & Behavior'},{k:'comms',l:'Communication'},{k:'challenge',l:'Live Challenge 🔥'}].map(t => (
          <button key={t.k} onClick={() => { setTab(t.k); if(t.k==='comms') loadComms(); }}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${tab===t.k?'bg-blue-600 text-white shadow':'text-gray-500 hover:bg-blue-50'}`}>{t.l}</button>
        ))}
      </div>

      {/* TAB: Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed">{d.description}</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Entry</p><p className="font-bold text-emerald-700 text-sm">{d.salary_india?.entry}</p></div>
              <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Mid</p><p className="font-bold text-blue-700 text-sm">{d.salary_india?.mid}</p></div>
              <div className="bg-purple-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-500">Senior</p><p className="font-bold text-purple-700 text-sm">{d.salary_india?.senior}</p></div>
            </div>
          </div>
          <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-2">Key Skills</h3>
            <div className="flex flex-wrap gap-2">{(d.key_skills||[]).map((s,i) => <Badge key={i}>{s}</Badge>)}</div>
          </div>
          <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-2">🎓 Education Path</h3><p className="text-sm text-gray-600">{d.education_path}</p>
            {d.related_exams?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{d.related_exams.map((e,i) => <Badge key={i} variant="warning">{e}</Badge>)}</div>}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-blue-700 mb-2">🚀 Future Scope</h3><p className="text-sm text-blue-800">{d.future_scope}</p>
          </div>
          {d.famous_indians?.length > 0 && (
            <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-700 mb-2">🇮🇳 Famous Indians</h3>
              {d.famous_indians.map((f,i) => <p key={i} className="text-sm text-gray-600 mb-1">⭐ {f}</p>)}
            </div>
          )}
        </div>
      )}

      {/* TAB: Levels */}
      {tab === 'levels' && (
        <div>
          <div className="flex gap-2 mb-4">{['beginner','intermediate','advanced'].map(l => (
            <button key={l} onClick={() => setActiveLevel(l)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition ${activeLevel===l?'bg-blue-600 text-white shadow':'bg-white border border-blue-100 text-gray-600 hover:bg-blue-50'}`}>
              {l === 'beginner' ? '🌱' : l === 'intermediate' ? '🌿' : '🌳'} {l}
            </button>
          ))}</div>

          {levels[activeLevel] && (
            <div className="space-y-3">
              <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
                <h3 className="font-heading font-bold text-gray-900">{levels[activeLevel].title}</h3>
                <p className="text-sm text-gray-500 mt-1">{levels[activeLevel].description}</p>
              </div>
              {(levels[activeLevel].tasks||[]).map((t,i) => (
                <div key={i} className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{i+1}</span>
                      <h4 className="font-bold text-gray-900 text-sm">{t.task}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Clock size={12}/>{t.time}<Zap size={12} className="text-amber-500 ml-1"/>{t.xp} XP</div>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">{t.description}</p>
                </div>
              ))}
              {levels[activeLevel].skills_to_learn && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-bold text-xs text-blue-700 uppercase mb-2">Skills you'll learn at this level:</p>
                  <div className="flex flex-wrap gap-1">{levels[activeLevel].skills_to_learn.map((s,i) => <Badge key={i} variant="primary">{s}</Badge>)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: Ethics & Behavior */}
      {tab === 'ethics' && ps.ethics && (
        <div className="space-y-4">
          <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2"><Shield size={16} className="text-blue-500" /> Code of Conduct</h3>
            {(ps.ethics.code_of_conduct||[]).map((c,i) => <p key={i} className="text-sm text-gray-600 mb-1.5 flex items-start gap-2"><span className="text-blue-500 mt-0.5">✦</span>{c}</p>)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="font-bold text-xs text-emerald-700 uppercase mb-2">Do ✓</p>
              {(ps.ethics.do_and_dont?.do||[]).map((d,i) => <p key={i} className="text-sm text-emerald-800 mb-1">✓ {d}</p>)}
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-bold text-xs text-red-700 uppercase mb-2">Don't ✗</p>
              {(ps.ethics.do_and_dont?.dont||[]).map((d,i) => <p key={i} className="text-sm text-red-800 mb-1">✗ {d}</p>)}
            </div>
          </div>
          {ps.behavior && (
            <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-sm text-gray-700 mb-3">🎭 Professional Behavior</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600"><span className="font-semibold">Dress Code:</span> {ps.behavior.dress_code}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Work Culture:</span> {ps.behavior.work_culture}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Daily Routine:</span> {ps.behavior.daily_routine}</p>
                <div className="flex flex-wrap gap-1 mt-2">{(ps.behavior.personality_traits||[]).map((t,i) => <Badge key={i} variant="primary">{t}</Badge>)}</div>
              </div>
            </div>
          )}
          {ps.ethics.common_dilemmas && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-bold text-xs text-amber-700 uppercase mb-2">Ethical Dilemmas You May Face</p>
              {ps.ethics.common_dilemmas.map((d,i) => <p key={i} className="text-sm text-amber-800 mb-1">🤔 {d}</p>)}
            </div>
          )}
        </div>
      )}

      {/* TAB: Communication */}
      {tab === 'comms' && (
        <div className="space-y-4">
          {loadingComms ? <div className="text-center py-12"><Spinner /><p className="text-sm text-gray-400 mt-2">Loading communication guides...</p></div> : comms ? (
            <>
              {ps.communication && (
                <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2"><MessageSquare size={16} className="text-blue-500" /> Communication Style</h3>
                  <p className="text-sm text-gray-600">{ps.communication.style}</p>
                  {ps.communication.client_interaction && <p className="text-sm text-gray-500 mt-2 italic">💬 {ps.communication.client_interaction}</p>}
                </div>
              )}
              {comms.email_templates && (
                <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2"><Mail size={16} className="text-blue-500" /> Professional Email Templates</h3>
                  {comms.email_templates.map((e,i) => (
                    <div key={i} className="mb-4 last:mb-0 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{e.scenario}</p>
                      <p className="text-xs text-gray-400 mb-1">Subject: {e.subject}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{e.body}</p>
                      <Badge variant="gray" className="mt-2">{e.tone}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {comms.common_phrases && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-bold text-xs text-blue-700 uppercase mb-2">Common Professional Phrases</p>
                  {comms.common_phrases.map((p,i) => <p key={i} className="text-sm text-blue-800 mb-1">💬 "{p}"</p>)}
                </div>
              )}
            </>
          ) : <p className="text-center py-8 text-gray-400">Click the Communication tab to load guides</p>}
        </div>
      )}

      {/* TAB: Live Challenge */}
      {tab === 'challenge' && (
        <div>
          {!challenge && !loadingChallenge && (
            <div className="bg-white border border-blue-100/60 rounded-2xl p-8 shadow-sm text-center">
              <Trophy size={40} className="text-amber-500 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">Ready for a Challenge?</h3>
              <p className="text-sm text-gray-500 mb-4">AI will create a unique, real-world challenge for you as a {profName}</p>
              <div className="flex gap-2 justify-center mb-4">{['beginner','intermediate','advanced'].map(l => (
                <button key={l} onClick={() => setActiveLevel(l)} className={`px-4 py-1.5 rounded-lg text-sm capitalize ${activeLevel===l?'bg-blue-600 text-white':'bg-gray-100 text-gray-600'}`}>{l}</button>
              ))}</div>
              <Button onClick={loadChallenge}><Play size={16} /> Generate Challenge</Button>
            </div>
          )}
          {loadingChallenge && <div className="text-center py-12"><Spinner /><p className="text-sm text-gray-400 mt-2">AI is creating your challenge...</p></div>}
          {challenge && !loadingChallenge && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-bold text-gray-900">{challenge.challenge_title}</h3>
                  <div className="flex items-center gap-1 text-amber-600"><Zap size={14} /><span className="text-sm font-bold">{challenge.xp_reward} XP</span></div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic mb-3">"{challenge.scenario}"</p>
                <p className="font-bold text-sm text-gray-800">🎯 Objective: {challenge.objective}</p>
              </div>
              <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-sm text-gray-700 mb-3">Steps to Complete:</h4>
                {(challenge.steps||[]).map((s,i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 mt-0.5">{i+1}</span>
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400"><Clock size={13} /> Time: {challenge.time_limit}</div>
              </div>
              {challenge.hint && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm text-blue-700">💡 Hint: {challenge.hint}</p></div>}
              {challenge.real_world_connection && <div className="bg-purple-50 border border-purple-200 rounded-xl p-4"><p className="text-sm text-purple-700">🌍 {challenge.real_world_connection}</p></div>}
              {challenge.bonus_challenge && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-sm text-amber-700">⭐ Bonus: {challenge.bonus_challenge}</p></div>}
              <Button onClick={loadChallenge} variant="secondary" className="w-full"><RefreshCw size={14} /> Generate New Challenge</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
