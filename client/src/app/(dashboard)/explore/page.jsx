'use client';
import { useState, useEffect, useCallback } from 'react';
import { searchAPI } from '@/lib/api/search.api';
import { followAPI } from '@/lib/api/follow.api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Building2, Search, Loader2, UserPlus, UserCheck,
  Briefcase, MapPin, Users, Sparkles, X, UserCog,
  GraduationCap, Star, ChevronRight,
} from 'lucide-react';

const HR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS',
  'Wipro', 'Accenture', 'Deloitte', 'SAP', 'IBM',
  'Cognizant', 'HCL', 'Capgemini', 'Oracle', 'Salesforce',
];
const HR_ROLES = [
  'HR Manager', 'Talent Acquisition', 'Recruiter', 'People Lead',
  'HRBP', 'Hiring Manager', 'Technical Recruiter', 'HR Director',
];
const CANDIDATE_INDUSTRIES = [
  'IT / Software', 'Finance / Banking', 'Healthcare', 'Education',
  'Manufacturing', 'Retail / E-commerce', 'Consulting', 'Other',
];
const CANDIDATE_SKILLS = [
  'React', 'Python', 'Data Science', 'Product Management',
  'Sales', 'Marketing', 'Finance', 'DevOps', 'Design', 'ML / AI',
];

function PersonCard({ person, onConnect, roleLabel }) {
  const [status, setStatus] = useState(person.is_following ? 'connected' : 'idle');

  const handle = async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      await followAPI.toggle(person.id);
      setStatus('connected');
      onConnect?.(person.id);
    } catch {
      setStatus('idle');
    }
  };

  const avatar = person.profile_photo_url
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.username || person.id)}`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${person.id}`}>
          <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
            onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${person.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors block truncate">
            {person.full_name || person.username}
          </Link>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {person.headline || person.profile?.hr_role || person.profile?.designation || roleLabel}
          </p>
          {(person.company || person.profile?.company_name || person.profile?.current_company) && (
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5 truncate">
              <Building2 size={10} /> {person.company || person.profile?.company_name || person.profile?.current_company}
            </p>
          )}
          {person.location && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {person.location}
            </p>
          )}
        </div>
      </div>

      {person.mutual_connections > 0 && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Users size={10} /> {person.mutual_connections} mutual connection{person.mutual_connections > 1 ? 's' : ''}
        </p>
      )}

      <div className="flex gap-2">
        <button onClick={handle} disabled={status !== 'idle'}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            status === 'connected'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
          } disabled:opacity-60`}>
          {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> :
           status === 'connected' ? <><UserCheck size={12} /> Connected</> :
           <><UserPlus size={12} /> Connect</>}
        </button>
        <Link href={`/profile/${person.id}`}
          className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-2 bg-gray-100 rounded w-1/2" />
          <div className="h-2 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ─── HR PROFESSIONALS MODE (for professional learners and others) ───────────

function HRExplorerMode({ user }) {
  const [query, setQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q = query, company = selectedCompany) => {
    const term = [q, company].filter(Boolean).join(' ') || 'hr recruiter';
    setLoading(true);
    setSearched(true);
    try {
      const r = await searchAPI.search({ q: term, type: 'people', user_type: 'hr_professional', limit: 18 });
      const people = r.data?.data?.users || r.data?.data || r.data || [];
      setResults(Array.isArray(people) ? people.filter(p => p.id !== user?.id) : []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query, selectedCompany, user?.id]);

  useEffect(() => { doSearch('', ''); }, []);

  const selectCompany = (co) => {
    const next = selectedCompany === co ? '' : co;
    setSelectedCompany(next);
    doSearch(query, next);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search by name, role, company…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all" />
        </div>
        <button onClick={() => doSearch()} disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
        </button>
      </div>

      {/* Company chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by company</p>
        <div className="flex flex-wrap gap-1.5">
          {HR_COMPANIES.map(co => (
            <button key={co} onClick={() => selectCompany(co)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedCompany === co
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}>
              {selectedCompany === co && <X size={10} />}
              <Building2 size={10} /> {co}
            </button>
          ))}
        </div>
      </div>

      {/* Role chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by role</p>
        <div className="flex flex-wrap gap-1.5">
          {HR_ROLES.map(role => (
            <button key={role} onClick={() => { setQuery(role); doSearch(role, selectedCompany); }}
              className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-all">
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 text-center">
          <UserCog size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 mb-1">No HR professionals found</p>
          <p className="text-xs text-gray-400">Try a different company or role filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(p => <PersonCard key={p.id} person={p} roleLabel="HR Professional" />)}
        </div>
      )}
    </div>
  );
}

// ─── CANDIDATES MODE (for HR professionals) ──────────────────────────────────

function CandidateBrowserMode({ user }) {
  const [query, setQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q = query, industry = selectedIndustry) => {
    const term = [q, industry].filter(Boolean).join(' ') || '';
    setLoading(true);
    setSearched(true);
    try {
      const r = await searchAPI.search({ q: term, type: 'people', user_type: 'professional_learner', limit: 18 });
      const people = r.data?.data?.users || r.data?.data || r.data || [];
      setResults(Array.isArray(people) ? people.filter(p => p.id !== user?.id) : []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [query, selectedIndustry, user?.id]);

  useEffect(() => { doSearch('', ''); }, []);

  const selectIndustry = (ind) => {
    const next = selectedIndustry === ind ? '' : ind;
    setSelectedIndustry(next);
    doSearch(query, next);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search by name, skill, designation…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all" />
        </div>
        <button onClick={() => doSearch()} disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
        </button>
      </div>

      {/* Industry chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by industry</p>
        <div className="flex flex-wrap gap-1.5">
          {CANDIDATE_INDUSTRIES.map(ind => (
            <button key={ind} onClick={() => selectIndustry(ind)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedIndustry === ind
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
              }`}>
              {selectedIndustry === ind && <X size={10} />}
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Skill quick filters */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter by skill</p>
        <div className="flex flex-wrap gap-1.5">
          {CANDIDATE_SKILLS.map(skill => (
            <button key={skill} onClick={() => { setQuery(skill); doSearch(skill, selectedIndustry); }}
              className="px-3 py-1.5 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-all">
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 text-center">
          <Users size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 mb-1">No candidates found</p>
          <p className="text-xs text-gray-400">Try a different skill or industry filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(p => <PersonCard key={p.id} person={p} roleLabel="Professional" />)}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const { user } = useAuth();
  const isHR = user?.user_type === 'hr_professional';
  // HR defaults to candidate browser, others default to HR Explorer
  const [mode, setMode] = useState(isHR ? 'candidates' : 'hr');

  const tabs = [
    {
      key: 'hr',
      icon: UserCog,
      label: 'HR Professionals',
      sub: 'Find recruiters & hiring managers',
      color: isHR ? 'text-gray-500' : 'text-blue-600',
      activeColor: 'bg-blue-600',
    },
    {
      key: 'candidates',
      icon: Users,
      label: 'Talent Pool',
      sub: 'Find professional candidates',
      color: isHR ? 'text-teal-600' : 'text-gray-500',
      activeColor: 'bg-teal-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {mode === 'candidates'
              ? <><Users size={22} className="text-teal-600" /> Talent Discovery</>
              : <><Briefcase size={22} className="text-blue-600" /> HR Explorer</>
            }
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mode === 'candidates'
              ? 'Browse professional learners and candidates to connect with'
              : 'Connect with HR professionals and recruiters from top companies'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setMode(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === t.key
                  ? `${t.activeColor} text-white shadow-sm`
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode content */}
      {mode === 'hr'
        ? <HRExplorerMode user={user} />
        : <CandidateBrowserMode user={user} />
      }
    </div>
  );
}
