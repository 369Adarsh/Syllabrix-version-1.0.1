'use client';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Target, Briefcase, MapPin, Award, Zap, 
  UserCircle, FileText, Layout, ChevronRight,
  ExternalLink, Github, Linkedin, Globe, Mail,
  Star, BadgeCheck, Pencil, Sparkles, Building2,
  UploadCloud, CheckCircle, Check, Copy, Shield, Lock, X, Loader2, History
} from 'lucide-react';
import Image from 'next/image';
import { uploadAPI } from '@/lib/api/upload.api';
import { careerAPI } from '@/lib/api/career.api';
import { toast } from 'react-hot-toast';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm p-5 md:p-8 overflow-hidden ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ label, score, color = "bg-blue-600" }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
      <span>{label}</span>
      <span className="text-gray-900">{score}%</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
);

const ResumeInteractionCard = ({ user, resumeUrl, onCalibrated }) => {
  const [uploading, setUploading] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to storage
      const res = await uploadAPI.resume(file);
      const url = res.data?.data?.url;
      
      // 2. Systematic Calibration
      setCalibrating(true);
      toast.loading('Synchronizing profile with resume...', { id: 'cal' });
      
      await careerAPI.calibrateResume({ resume_url: url });
      
      toast.success('Profile systematically calibrated!', { id: 'cal' });
      if (onCalibrated) await onCalibrated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload/Sync failed', { id: 'cal' });
    } finally {
      setUploading(false);
      setCalibrating(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Card className="relative overflow-hidden group border-blue-100 bg-blue-50/30">
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            <h3 className="text-[13px] font-black text-blue-900 uppercase tracking-widest">Resume Calibration</h3>
          </div>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="space-y-4">
          <label className="block p-6 border-2 border-dashed border-blue-200 rounded-[24px] bg-white/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer text-center group/upload">
            <input 
              ref={inputRef}
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleUpload}
              disabled={uploading || calibrating}
            />
            {uploading || calibrating ? (
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest leading-tight">
                  {uploading ? 'Uploading PDF...' : 'AI Calibration...'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto text-blue-600 group-hover/upload:scale-110 transition-transform">
                  <UploadCloud size={20} />
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  {resumeUrl ? 'Update Resume' : 'Upload Resume'}
                </p>
                {resumeUrl && (
                  <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Check size={10} /> Verified Sync
                  </div>
                )}
                <p className="text-[9px] text-gray-400 font-medium">Auto-sync skills & experience</p>
              </div>
            )}
          </label>
        </div>
      </div>
    </Card>
  );
};

export default function ProfessionalProfile({ user, dashboardData, onEdit, onRefresh, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const p = user?.profile || {};
  const cp = dashboardData?.profile || {};
  const skills = dashboardData?.skillProfile?.skills_detected || [];
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    current_role: cp.current_role || cp.designation || '',
    current_company: cp.current_company || '',
    industry: cp.industry || '',
    experience_years: cp.experience_years || p.experience_years || 0
  });

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel
      setFormData({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        current_role: cp.current_role || cp.designation || '',
        current_company: cp.current_company || '',
        industry: cp.industry || '',
        experience_years: cp.experience_years || p.experience_years || 0
      });
    }
    setIsEditing(!isEditing);
    if (onEdit) onEdit(!isEditing); 
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) await onSave(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const mainSkills = skills.slice(0, 3).map(s => ({
    name: s.name,
    score: s.level === 'expert' ? 95 : s.level === 'intermediate' ? 75 : 45
  }));

  const timeline = [
    { company: cp.current_company || 'Syllabrix Platforms', role: cp.designation || 'Lead Design Strategist', period: 'Present', current: true },
    { company: 'Professional History', role: 'Verified Industry Experience', period: `${p.experience_years || 0} Years`, current: false },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Banner */}
      <Card className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-1">
              <div className="w-full h-full rounded-[28px] bg-white overflow-hidden flex items-center justify-center">
                {user?.profile_photo_url ? (
                  <Image src={user.profile_photo_url} alt="" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={64} className="text-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              {isEditing ? (
                <input 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full text-2xl md:text-4xl font-black text-gray-900 leading-none bg-blue-50/50 border-b-2 border-blue-600 focus:outline-none px-2 py-1"
                />
              ) : (
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-none break-words">
                  {user?.full_name || user?.username}
                </h1>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 shrink-0">
                  Professional
                </span>
                <span className="px-4 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shrink-0">
                  <MapPin size={10} /> {user?.city || 'India'}
                </span>
                {(dashboardData?.professional_id || user?.professional_id) && (
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-200">
                    <Shield size={10} /> {dashboardData?.professional_id || user?.professional_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
            <button 
              onClick={handleToggleEdit}
              className={`px-6 py-3 ${isEditing ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-900'} hover:opacity-80 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all shadow-sm`}
            >
              {isEditing ? <X size={14} /> : <Pencil size={14} />}
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Skill Level</p>
              <h3 className="text-xl font-black text-gray-900">
                {dashboardData?.marketFitScore > 80 ? 'Expert' : dashboardData?.marketFitScore > 50 ? 'Advanced' : 'Developing'}
              </h3>
              <p className="text-[10px] text-indigo-600 font-bold">
                Top {dashboardData?.marketPercentile || (dashboardData?.marketFitScore ? Math.min(99, dashboardData.marketFitScore + 10) : '...')} Percentile
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-100">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Certificates</p>
              <h3 className="text-xl font-black text-gray-900">
                {dashboardData?.certificates_count || (dashboardData?.resume_url ? 'Verified' : '0')}
              </h3>
              <p className="text-[10px] text-violet-600 font-bold">Credentialed Growth</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 shrink-0 relative shadow-sm">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="#F3F4F6" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="#2563EB" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (dashboardData?.marketFitScore || 0) / 100)} />
               </svg>
               <span className="text-[10px] font-black text-gray-900 relative z-10">{dashboardData?.marketFitScore || 0}%</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Market Fit</p>
              <h3 className="text-xl font-black text-gray-900">{dashboardData?.marketFitScore || 0}% Match</h3>
              <p className="text-[10px] text-blue-600 font-bold">Strategy Calibration</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Identity & History */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900">Professional Identity</h2>
              <Layout size={18} className="text-gray-300" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Primary Role</p>
                {isEditing ? (
                  <input 
                    name="current_role"
                    value={formData.current_role}
                    onChange={handleChange}
                    className="w-full text-[14px] font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-[15px] font-bold text-gray-900 break-words">{cp.current_role || cp.designation || 'Senior Professional'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Industry Focus</p>
                {isEditing ? (
                  <input 
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full text-[14px] font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-[15px] font-bold text-gray-900 break-words">{cp.industry || 'Technology'}</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Career Bio / Summary</p>
              {isEditing ? (
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full text-[13px] text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {user?.bio || 'Passionate professional focused on leveraging technology to drive innovation and growth.'}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900">Work History</h2>
              <Briefcase size={18} className="text-gray-300" />
            </div>

            <div className="space-y-6">
              {(dashboardData?.work_history?.length > 0 || timeline.length > 0) ? (
                (dashboardData?.work_history?.length > 0 ? dashboardData.work_history : timeline).map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      <Building2 size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0 pb-6 border-b border-gray-50 last:border-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-black text-gray-900 truncate">{item.company}</h4>
                          <p className="text-[12px] text-gray-500 truncate">{item.role} • {item.period}</p>
                          {item.description && (
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        {item.current && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100 shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <History size={20} />
                  </div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">No history calibrated</p>
                  <p className="text-[10px] text-gray-400">Upload resume to sync work history</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {isEditing && (
            <Card className="border-2 border-emerald-500 bg-emerald-50/20">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-emerald-900">Unsaved Changes</h3>
                <p className="text-[11px] text-emerald-700 font-medium">Review your profile updates and save when ready.</p>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button 
                  onClick={handleToggleEdit}
                  className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-900">Core Skills</h2>
              <Target size={18} className="text-gray-300" />
            </div>

            <div className="space-y-6 mb-8">
              {mainSkills.length > 0 ? mainSkills.map((s, i) => (
                <ProgressBar key={i} label={s.name} score={s.score} />
              )) : (
                <p className="text-[11px] text-gray-400 italic">No skills analyzed yet. Upload resume to calibrate.</p>
              )}
            </div>

            {skills.length > 3 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
                {skills.slice(3, 10).map(s => (
                  <span key={s.name} className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <ResumeInteractionCard 
            user={user} 
            resumeUrl={dashboardData?.resume_url} 
            onCalibrated={onRefresh}
          />

          <Card>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest text-[11px] text-gray-400">Connectivity</h2>
            </div>
            
            <div className="space-y-4">
              <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 text-left">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-100">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate">Professional Email</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-100">
                    <Linkedin size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 truncate">LinkedIn Profile</p>
                    <p className="text-[10px] text-gray-400 truncate">View Profile</p>
                  </div>
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
