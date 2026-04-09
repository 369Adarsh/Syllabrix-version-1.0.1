'use client';
import React, { useRef, useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, 
  Download, FileText, Award, Briefcase, GraduationCap,
  Shield, CheckCircle2, Edit2, Check, X, Sparkles, Zap,
  RefreshCw, Plus, ShieldCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

const EditableField = ({ value, onSave, label, type = 'text', multiline = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  if (!isEditing) {
    return (
      <div className="group relative">
        <div className="pr-8">{value}</div>
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:bg-blue-50 rounded"
        >
          <Edit2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full p-2 text-sm border-2 border-blue-500 rounded-xl focus:outline-none bg-blue-50 min-h-[100px]"
          autoFocus
        />
      ) : (
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="w-full p-2 text-sm border-2 border-blue-500 rounded-lg focus:outline-none bg-blue-50"
          autoFocus
        />
      )}
      <div className="flex gap-2">
        <button 
          onClick={() => { onSave(tempValue); setIsEditing(false); }}
          className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
        >
          <Check size={10} /> Save
        </button>
        <button 
          onClick={() => { setTempValue(value); setIsEditing(false); }}
          className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg flex items-center gap-1"
        >
          <X size={10} /> Cancel
        </button>
      </div>
    </div>
  );
};

const ResumePreview = ({ profile, user, skills, workHistory, onUpdate, syncing }) => {
  const resumeRef = useRef();
  const [editableRole, setEditableRole] = useState(profile?.current_role || '');
  const [localHistory, setLocalHistory] = useState(workHistory || []);
  const [localSkills, setLocalSkills] = useState(skills || []);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setEditableRole(profile?.current_role || '');
    setLocalHistory(workHistory || []);
    setLocalSkills(skills || []);
  }, [profile, workHistory, skills]);

  const handleDownload = async () => {
    const element = resumeRef.current;
    const buttons = element.querySelectorAll('button');
    buttons.forEach(b => b.style.display = 'none');
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    buttons.forEach(b => b.style.display = '');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${user?.name || 'Resume'}_Architecture.pdf`);
  };

  const syncProfile = (data) => onUpdate?.('profile', data);
  const syncSkills = (nextSkills) => onUpdate?.('skills', nextSkills);

  const updateHistory = (index, field, newVal) => {
    const next = [...localHistory];
    next[index] = { ...next[index], [field]: newVal };
    setLocalHistory(next);
    syncProfile({ work_history: next });
  };

  const addHistory = () => {
    const newItem = { role: 'New Strategic Role', company: 'Global Enterprise', period: '2024 - Present', description: 'Driving mission-critical initiatives and operational excellence.' };
    const next = [newItem, ...localHistory];
    setLocalHistory(next);
    syncProfile({ work_history: next });
  };

  const removeHistory = (index) => {
    const next = localHistory.filter((_, i) => i !== index);
    setLocalHistory(next);
    syncProfile({ work_history: next });
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const next = [...localSkills, { name: newSkill, level: 'expert' }];
    setLocalSkills(next);
    syncSkills(next);
    setNewSkill('');
    setIsAddingSkill(false);
  };

  const removeSkill = (name) => {
    const next = localSkills.filter(s => (s.name || s) !== name);
    setLocalSkills(next);
    syncSkills(next);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm shadow-gray-100/50">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-xl ${syncing ? 'bg-amber-100 animate-pulse' : 'bg-indigo-50'}`}>
              <Sparkles size={18} className={syncing ? 'text-amber-600' : 'text-indigo-600'} />
           </div>
           <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                {syncing ? 'AI SYNCING...' : 'Professional Lab'}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                {syncing ? 'Re-calibrating trajectory' : 'Architecture Mode Active'}
              </p>
           </div>
        </div>
        <div className="flex gap-4">
           <button
             onClick={handleDownload}
             className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
           >
             <Download size={14} /> Export PDF
           </button>
        </div>
      </div>

      <div className="bg-gray-200/50 p-6 sm:p-12 rounded-[3.5rem] overflow-x-auto border-4 border-white shadow-inner">
        <div 
          ref={resumeRef}
          className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto flex flex-col text-gray-900 font-sans relative"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {syncing && (
             <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[100] flex items-center justify-center transition-all">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/20">
                   <RefreshCw size={18} className="animate-spin text-indigo-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest">AI Recalibrating...</span>
                </div>
             </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex flex-1">
            
            {/* Left Sidebar (Accented) */}
            <aside className="w-[75mm] bg-slate-900 text-white p-10 flex flex-col group/sidebar">
              {/* Profile Image/Initial */}
              <div className="w-24 h-24 bg-white/10 rounded-3xl mb-12 flex items-center justify-center border border-white/20 relative overflow-hidden">
                 {user?.avatar_url ? (
                   <img src={user.avatar_url} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-black text-white/40">{user?.name?.charAt(0)}</span>
                 )}
                 <div className="absolute inset-x-0 bottom-0 bg-indigo-500 h-1" />
              </div>

              {/* Contact Information */}
              <section className="mb-14">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <div className="w-4 h-[1px] bg-indigo-400" /> CONTACT
                </h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl"><Mail size={12} className="text-indigo-300" /></div>
                    <span className="text-[11px] font-medium text-slate-300 break-all leading-relaxed mt-1">{user?.email}</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl"><MapPin size={12} className="text-indigo-300" /></div>
                    <span className="text-[11px] font-medium text-slate-300 leading-relaxed mt-1">{user?.city || 'Bengaluru, India'}</span>
                  </li>
                  {profile?.website && (
                    <li className="flex items-start gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl"><Globe size={12} className="text-indigo-300" /></div>
                      <span className="text-[11px] font-medium text-slate-300 break-all leading-relaxed mt-1">{profile.website.replace(/^https?:\/\//, '')}</span>
                    </li>
                  )}
                </ul>
              </section>

              {/* Core Expertise */}
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-4 h-[1px] bg-indigo-400" /> CORE EXPERTISE
                   </h3>
                   <button onClick={() => setIsAddingSkill(true)} className="p-1 hover:bg-white/10 rounded transition-colors text-indigo-300">
                      <Plus size={14} />
                   </button>
                </div>
                
                <AnimatePresence>
                  {isAddingSkill && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={addSkill} 
                      className="mb-4 space-y-2 overflow-hidden"
                    >
                      <input 
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        placeholder="New Skill..."
                        className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-[10px] text-white outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-1.5 bg-indigo-600 text-[9px] font-black rounded-lg">CALIBRATE</button>
                        <button type="button" onClick={() => setIsAddingSkill(false)} className="px-3 py-1.5 bg-white/5 text-[9px] font-black rounded-lg">X</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2.5">
                  {localSkills?.length > 0 ? localSkills.map((s, i) => (
                    <span key={i} className="group flex items-center gap-2 px-3 py-2 bg-white/5 text-[9px] font-black text-white rounded-xl border border-white/10 uppercase tracking-widest hover:border-indigo-500 transition-all cursor-default">
                      {s.name || s}
                      <button onClick={() => removeSkill(s.name || s)} className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all">
                        <X size={10} />
                      </button>
                    </span>
                  )) : (
                    <p className="text-[10px] text-white/40 italic">Add skills to calibrate...</p>
                  )}
                </div>
              </section>

              {/* Verified Identity */}
              <div className="mt-auto pt-10 border-t border-white/5">
                 <div className="p-5 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20">
                    <p className="text-[8px] font-black text-indigo-300 tracking-[0.2em] uppercase mb-1">Architectural ID</p>
                    <p className="text-xs font-black text-white tracking-widest">{user?.professional_id || 'CALIBRATION_HUB'}</p>
                 </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-16 flex flex-col">
              
              {/* Header Title */}
              <div className="mb-20">
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] mb-6">
                  {user?.name?.split(' ').map((n, i) => (
                    <span key={i} className={i % 2 !== 0 ? 'text-indigo-600' : ''}>{n} </span>
                  ))}
                </h1>
                <div className="flex items-center gap-5">
                  <span className="h-[3px] w-14 bg-indigo-600 rounded-full" />
                  <div className="flex-1 text-2xl text-slate-500 font-black uppercase tracking-[0.1em]">
                    <EditableField 
                      value={editableRole} 
                      onSave={(v) => { setEditableRole(v); syncProfile({ current_role: v }); }} 
                    />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <section className="flex-1">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-2xl"><Briefcase size={20} className="text-slate-900" /></div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Impact History</h3>
                   </div>
                   <button onClick={addHistory} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                     + Add Role
                   </button>
                </div>

                <div className="space-y-16">
                  {localHistory?.length > 0 ? localHistory.map((item, i) => (
                    <div key={i} className="relative group/exp">
                      <div className="absolute -left-[54px] top-2 w-3.5 h-3.5 bg-white border-[3px] border-indigo-600 rounded-full z-10" />
                      {i < localHistory.length - 1 && (
                        <div className="absolute -left-[48.5px] top-6 w-[2px] h-[calc(100%+64px)] bg-slate-100" />
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <button onClick={() => removeHistory(i)} className="absolute -right-8 top-0 opacity-0 group-hover/exp:opacity-100 p-2 text-rose-300 hover:text-rose-600 transition-all">
                             <X size={16} />
                          </button>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            <EditableField value={item.role} onSave={(v) => updateHistory(i, 'role', v)} />
                          </h4>
                          <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                            <EditableField value={item.company || item.company_name} onSave={(v) => updateHistory(i, 'company', v)} />
                          </span>
                        </div>
                        <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] whitespace-nowrap">
                           {item.period}
                        </div>
                      </div>
                      
                      <div className="text-[13.5px] text-slate-500 leading-relaxed font-semibold mt-4 bg-gray-50/30 p-4 rounded-[1.5rem] border border-transparent hover:border-gray-100 transition-all">
                         <EditableField 
                           value={item.description || 'Executing mission-critical strategies and infrastructure to drive organizational growth.'} 
                           onSave={(v) => updateHistory(i, 'description', v)} 
                           multiline
                         />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-16 border-4 border-dashed border-slate-50 rounded-[3rem]">
                       <Briefcase size={40} className="text-slate-100 mx-auto mb-4" />
                       <p className="text-xs text-slate-300 font-black uppercase tracking-[0.2em]">Impact History Not Calibrated</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Verify Badge */}
              <div className="mt-20 flex justify-between items-center opacity-30">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Built in Syllabrix Laboratory • Phase E Engine</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-slate-900" />
                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em]">Verified Portfolio Architecture</p>
                 </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
