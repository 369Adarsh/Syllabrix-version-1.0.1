'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Briefcase, Activity, Loader2, ExternalLink } from 'lucide-react';
import { careerAPI } from '@/lib/api/career.api';

const TRENDING_SKILLS = [
  { name: 'LLM Prompting',      delta: '+240%', pct: 90, color: 'bg-blue-500'   },
  { name: 'Cloud Architecture', delta: '+12%',  pct: 55, color: 'bg-indigo-500' },
  { name: 'Strategic Foresight',delta: '+18%',  pct: 65, color: 'bg-violet-500' },
];

function TrendingSkillsCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Trending Skills</h3>
        </div>
        <TrendingUp size={13} className="text-blue-400" />
      </div>

      <div className="space-y-3.5">
        {TRENDING_SKILLS.map(skill => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-700">{skill.name}</span>
              <span className="text-xs font-bold text-blue-600">{skill.delta}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                style={{ width: `${skill.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/career/skills"
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
      >
        Explore All Skills <ArrowRight size={12} />
      </Link>
    </div>
  );
}

function TopJobMatchesCard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerAPI.listJobs({ limit: 2, category: 'high' })
      .then(res => setJobs((res.data?.data?.jobs || []).slice(0, 2)))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const FIT_COLORS = {
    high: 'bg-emerald-50 text-emerald-700',
    medium: 'bg-blue-50 text-blue-700',
    stretch: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Top Job Matches</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="text-blue-500 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No matches yet. Sync your profile.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const logoOk = job.company_logo && !job.company_logo.includes('undefined');
            const fit = FIT_COLORS[job.fit_category] || FIT_COLORS.medium;
            return (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoOk ? (
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-1" onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <span className="text-sm font-black text-blue-600">{job.company_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{job.role_title}</p>
                  <p className="text-[11px] text-gray-400 truncate">{job.company_name} · {job.location}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${fit}`}>
                  {job.fit_score}% Match
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/career/jobs"
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
      >
        View Personalised Jobs <ArrowRight size={12} />
      </Link>
    </div>
  );
}

function MarketPulseCard() {
  const [jobCount, setJobCount] = useState(null);

  useEffect(() => {
    careerAPI.getJobCount()
      .then(res => setJobCount(res.data?.data?.total || 0))
      .catch(() => setJobCount(null));
  }, []);

  const score = 8.4;
  const bars = [3, 5, 8, 6, 9, 7, 10, 8, 6, 9, 7, 8];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-blue-600" />
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Pulse</h3>
      </div>

      <div className="flex items-end justify-between mb-1">
        <div>
          <span className="text-3xl font-black text-gray-900">{score}</span>
          <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">High Activity</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
        Hiring in your sector is <span className="text-emerald-600 font-semibold">trending up</span>. Talent competition is currently moderate.
        {jobCount !== null && <span> <strong className="text-blue-600">{jobCount}</strong> roles matched.</span>}
      </p>

      {/* Mini bar chart */}
      <div className="flex items-end gap-0.5 h-12">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${i === bars.length - 1 ? 'bg-blue-600' : 'bg-blue-100'}`}
            style={{ height: `${(h / 10) * 100}%` }}
          />
        ))}
      </div>

      <Link
        href="/career"
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
      >
        View Full Dashboard <ExternalLink size={11} />
      </Link>
    </div>
  );
}

export default function FeedWidgets() {
  return (
    <div className="space-y-4">
      <TrendingSkillsCard />
      <TopJobMatchesCard />
      <MarketPulseCard />
    </div>
  );
}
