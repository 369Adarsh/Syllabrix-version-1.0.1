'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { experienceAPI } from '@/lib/api/experience.api';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FlaskConical, Search, Loader2, Star, TrendingUp, ChevronRight,
  Sparkles, BookOpen, ArrowLeft, RefreshCw, CheckCircle, Video,
  Lightbulb, Award, Users, BarChart3
} from 'lucide-react';

const SECTOR_ICONS = {
  'Technology': '💻', 'Healthcare': '🏥', 'Business': '💼', 'Creative': '🎨',
  'Science': '🔬', 'Education': '📚', 'Law': '⚖️', 'Engineering': '⚙️',
  'Entertainment': '🎭', 'Agriculture': '🌱', 'Hospitality': '🏨', 'Sports': '🏃',
  'Skilled Trades': '🔧', 'Spiritual': '🔮', 'Defence': '🛡️', 'Media': '📡',
  'Space': '🚀', 'Retail': '🛒', 'Logistics': '🚚', 'Finance': '💰',
};

export default function ExperienceLabPage() {
  const { user } = useAuth();
  const [view, setView] = useState('sectors'); // sectors | professions | detail
  const [sectors, setSectors] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [professionDetail, setProfessionDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [myProgress, setMyProgress] = useState(null);

  // Load sectors on mount
  useEffect(() => { loadSectors(); }, []);

  const loadSectors = async () => {
    setLoading(true);
    try {
      const res = await experienceAPI.getSectors();
      const data = res.data?.data || res.data || [];
      if (data.length > 0) {
        setSectors(data);
      } else {
        // Fallback: AI generates sector list
        const aiRes = await aiAPI.getAISectors();
        setSectors(aiRes.data?.data || aiRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load sectors:', err);
      toast.error('Could not load sectors');
    } finally { setLoading(false); }
  };

  const loadProfessions = async (sector) => {
    setSelectedSector(sector);
    setView('professions');
    setLoading(true);
    try {
      const res = await experienceAPI.getProfessions({ sector_id: sector.id });
      const data = res.data?.data || res.data || [];
      if (data.length > 0) {
        setProfessions(data);
      } else {
        // Fallback: AI generates professions for this sector
        const aiRes = await aiAPI.exploreProfession(sector.name || sector.title);
        const aiData = aiRes.data?.data || aiRes.data;
        if (Array.isArray(aiData)) {
          setProfessions(aiData);
        } else if (aiData?.professions) {
          setProfessions(aiData.professions);
        } else {
          setProfessions([]);
        }
      }
    } catch (err) {
      console.error('Failed to load professions:', err);
      setProfessions([]);
    } finally { setLoading(false); }
  };

  const loadDetail = async (profession) => {
    setSelectedProfession(profession);
    setView('detail');
    setActiveTab('overview');
    setLoading(true);
    setProfessionDetail(null);
    try {
      // Try backend first
      const slug = profession.slug || (profession.name || '').toLowerCase().replace(/\s+/g, '-');
      const res = await experienceAPI.getProfession(slug);
      setProfessionDetail(res.data?.data || res.data);
    } catch {
      // Fallback: AI explores the profession
      try {
        const aiRes = await aiAPI.exploreProfession(profession.name || profession.title);
        setProfessionDetail(aiRes.data?.data || aiRes.data || {
          name: profession.name || profession.title,
          description: profession.description || 'Explore this profession to learn more.',
        });
      } catch {
        setProfessionDetail({
          name: profession.name || profession.title,
          description: 'AI is temporarily unavailable. Please try again.',
        });
      }
    } finally { setLoading(false); }
  };

  const loadChallenge = async () => {
    if (!selectedProfession) return null;
    try {
      const res = await aiAPI.generateChallenge(
        selectedProfession.name || selectedProfession.title,
        'beginner'
      );
      return res.data?.data || res.data;
    } catch { return null; }
  };

  // ═══════════════════════════════════════════════════
  //  VIEW: SECTORS GRID
  // ═══════════════════════════════════════════════════
  if (view === 'sectors') {
    const filtered = sectors.filter(s =>
      !searchQuery || (s.name || s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200">
            <FlaskConical size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Experience Lab</h1>
            <p className="text-sm text-gray-500">Explore 1000+ real-world professions — learn by doing</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> AI Powered
          </span>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any profession — Chef, Astronaut, Tarot Reader, Developer..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Sectors grid */}
        {loading ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <Loader2 size={40} className="animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading sectors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <FlaskConical size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No sectors found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((sector, i) => (
              <button
                key={sector.id || i}
                onClick={() => loadProfessions(sector)}
                className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 text-left hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">{SECTOR_ICONS[sector.name || sector.title] || '🌟'}</div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {sector.name || sector.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {sector.profession_count || sector.count || '10+'} professions
                </p>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-500 mt-2 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  VIEW: PROFESSIONS LIST
  // ═══════════════════════════════════════════════════
  if (view === 'professions') {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => { setView('sectors'); setProfessions([]); setSelectedSector(null); }}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4 font-medium"
        >
          <ArrowLeft size={16} /> Back to sectors
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {SECTOR_ICONS[selectedSector?.name || selectedSector?.title] || '🌟'}{' '}
          {selectedSector?.name || selectedSector?.title}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Choose a profession to explore</p>

        {loading ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <Loader2 size={40} className="animate-spin text-purple-500 mx-auto" />
          </div>
        ) : professions.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center">
            <p className="text-gray-500">No professions loaded for this sector yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professions.map((prof, i) => (
              <button
                key={prof.id || i}
                onClick={() => loadDetail(prof)}
                className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 text-left hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 text-lg">
                  {prof.name || prof.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {prof.description || prof.tagline || 'Click to explore this profession'}
                </p>
                {(prof.difficulty_level || prof.min_age_group) && (
                  <div className="flex gap-2 mt-3">
                    {prof.difficulty_level && (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {prof.difficulty_level}
                      </span>
                    )}
                    {prof.min_age_group && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {prof.min_age_group}+
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-purple-600">
                  Explore <ChevronRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  VIEW: PROFESSION DETAIL (with tabs)
  // ═══════════════════════════════════════════════════
  const detail = professionDetail || {};
  const profName = detail.name || selectedProfession?.name || selectedProfession?.title || 'Profession';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'activities', label: 'Activities', icon: TrendingUp },
    { id: 'ethics', label: 'Ethics & Behavior', icon: BookOpen },
    { id: 'communication', label: 'Communication', icon: BarChart3 },
    { id: 'challenge', label: 'Live Challenge 🔥', icon: Sparkles },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => { setView('professions'); setProfessionDetail(null); }}
        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4 font-medium"
      >
        <ArrowLeft size={16} /> Back to {selectedSector?.name || 'professions'}
      </button>

      {loading ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <Loader2 size={40} className="animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">AI is preparing your exploration...</p>
        </div>
      ) : (
        <>
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{profName}</h1>
            <p className="text-gray-500 mt-1">{detail.tagline || detail.description || ''}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {detail.avg_salary_india && (
                <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">💰 {detail.avg_salary_india}</span>
              )}
              {detail.difficulty_level && (
                <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full">📊 {detail.difficulty_level}</span>
              )}
              {detail.education_path && (
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">🎓 {typeof detail.education_path === 'string' ? detail.education_path : 'Education path available'}</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 animate-fade-in">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {detail.day_in_life_text && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">A Day in the Life</h3>
                    <p className="text-gray-600 leading-relaxed">{detail.day_in_life_text}</p>
                  </div>
                )}
                {!detail.day_in_life_text && detail.description && (
                  <p className="text-gray-600 leading-relaxed">{detail.description}</p>
                )}
                {detail.skills_required && Array.isArray(detail.skills_required) && detail.skills_required.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.skills_required.map((s, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {detail.tools_used && Array.isArray(detail.tools_used) && detail.tools_used.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tools Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {detail.tools_used.map((t, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">🔧 {t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {detail.education_path && typeof detail.education_path === 'string' && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Education Path</h3>
                    <p className="text-gray-600">{detail.education_path}</p>
                  </div>
                )}
                {!detail.day_in_life_text && !detail.skills_required && (
                  <p className="text-gray-500">Detailed overview will be generated by AI when you explore activities.</p>
                )}
              </div>
            )}

            {/* ACTIVITIES */}
            {activeTab === 'activities' && (
              <ActivitiesTab professionId={selectedProfession?.id} profName={profName} />
            )}

            {/* ETHICS */}
            {activeTab === 'ethics' && (
              <AIContentTab
                title="Professional Ethics & Behavior"
                prompt={`Describe professional ethics, code of conduct, do's and don'ts, dress code, and workplace behavior for a ${profName}. Include real-world examples.`}
                profName={profName}
              />
            )}

            {/* COMMUNICATION */}
            {activeTab === 'communication' && (
              <AIContentTab
                title="Professional Communication"
                prompt={`Provide professional communication guide for a ${profName}: email templates, professional phrases, meeting scripts, client handling tips, and communication style.`}
                profName={profName}
              />
            )}

            {/* LIVE CHALLENGE */}
            {activeTab === 'challenge' && (
              <ChallengeTab profName={profName} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  ACTIVITIES TAB — loads from backend or AI
// ═══════════════════════════════════════════════════
function ActivitiesTab({ professionId, profName }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('beginner');

  useEffect(() => {
    loadActivities();
  }, [professionId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      if (professionId) {
        const res = await experienceAPI.getProfessions({ profession_id: professionId });
        const data = res.data?.data || [];
        if (data.length > 0) { setActivities(data); setLoading(false); return; }
      }
      // Fallback: AI generates activities
      const res = await aiAPI.generateChallenge(profName, activeLevel);
      const data = res.data?.data || res.data;
      if (data?.tasks || data?.activities) {
        setActivities(data.tasks || data.activities);
      } else if (Array.isArray(data)) {
        setActivities(data);
      } else {
        setActivities([]);
      }
    } catch {
      setActivities([]);
    } finally { setLoading(false); }
  };

  const levels = [
    { id: 'beginner', label: '🌱 Beginner', color: 'border-green-200 bg-green-50' },
    { id: 'intermediate', label: '🌿 Intermediate', color: 'border-amber-200 bg-amber-50' },
    { id: 'advanced', label: '🌳 Advanced', color: 'border-red-200 bg-red-50' },
  ];

  if (loading) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-purple-500 mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Level selector */}
      <div className="flex gap-2">
        {levels.map(level => (
          <button key={level.id} onClick={() => { setActiveLevel(level.id); loadActivities(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeLevel === level.id ? 'bg-purple-600 text-white border-purple-600' : `${level.color} text-gray-700 hover:border-purple-300`
            }`}>{level.label}</button>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No activities found. AI will generate them when available.</p>
          <button onClick={loadActivities} className="mt-3 text-purple-600 text-sm font-medium flex items-center gap-1 mx-auto">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => {
            const name = typeof activity === 'string' ? activity : activity.title || activity.name || `Activity ${i + 1}`;
            const desc = typeof activity === 'string' ? '' : activity.description || activity.instructions || '';
            return (
              <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{name}</h4>
                    {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full ml-3">
                    {activity.xp || 50} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={loadActivities} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
        <RefreshCw size={14} /> Generate new activities
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  AI CONTENT TAB — generic AI content loader
// ═══════════════════════════════════════════════════
function AIContentTab({ title, prompt, profName }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadContent(); }, [profName]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.clearDoubt(prompt, profName);
      const data = res.data?.data || res.data;
      setContent(typeof data === 'string' ? data : data?.answer || data?.response || JSON.stringify(data, null, 2));
    } catch {
      setContent('AI content temporarily unavailable. Please try again.');
    } finally { setLoading(false); }
  };

  if (loading) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-purple-500 mx-auto mb-2" /><p className="text-sm text-gray-500">AI is generating {title.toLowerCase()}...</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={loadContent} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
          <RefreshCw size={12} /> Regenerate
        </button>
      </div>
      <div className="prose prose-sm prose-gray max-w-none">
        <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">{content}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CHALLENGE TAB — AI-generated live challenge
// ═══════════════════════════════════════════════════
function ChallengeTab({ profName }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { generate(); }, [profName]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.generateChallenge(profName, 'beginner');
      setChallenge(res.data?.data || res.data);
    } catch {
      setChallenge({ title: 'Challenge unavailable', description: 'AI is temporarily unavailable. Please try again.' });
    } finally { setLoading(false); }
  };

  if (loading) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-purple-500 mx-auto mb-2" /><p className="text-sm text-gray-500">AI is creating a unique challenge...</p></div>;
  if (!challenge) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">🔥 {challenge.title || 'Live Challenge'}</h3>
      <p className="text-gray-600 leading-relaxed">{challenge.scenario || challenge.description}</p>

      {challenge.steps && Array.isArray(challenge.steps) && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Steps:</h4>
          <ol className="space-y-2 list-decimal list-inside">
            {challenge.steps.map((s, i) => <li key={i} className="text-gray-600">{s}</li>)}
          </ol>
        </div>
      )}

      {challenge.hints && Array.isArray(challenge.hints) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-medium text-amber-800 text-sm mb-1">💡 Hints</p>
          <ul className="space-y-1">
            {challenge.hints.map((h, i) => <li key={i} className="text-amber-700 text-sm">{h}</li>)}
          </ul>
        </div>
      )}

      <button onClick={generate} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
        <RefreshCw size={14} /> New Challenge
      </button>
    </div>
  );
}
