'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api/profile.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import { 
  Camera, Save, Settings, Loader2, User, MapPin, 
  Phone, Briefcase, ShieldAlert, Key, Globe, LayoutDashboard, Terminal 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [form, setForm] = useState({ 
    bio: user?.bio || '', 
    city: user?.city || '', 
    state: user?.state || '', 
    phone: user?.phone || '' 
  });
  
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try { 
      await profileAPI.update(form); 
      await refreshUser(); 
      toast.success('Profile updated successfully!', { icon: '✨' }); 
    }
    catch { toast.error('Failed to update profile'); } 
    finally { setLoading(false); }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { 
      await uploadAPI.profilePhoto(file); 
      await refreshUser(); 
      toast.success('Photo updated successfully!', { icon: '📸' }); 
    }
    catch { toast.error('Upload failed'); }
  };

  const hasAdminAccess = user?.user_type === 'syllabrix_admin' || user?.user_type === 'organization';

  const TABS = [
    { id: 'profile', label: 'Identity', icon: User },
    ...(hasAdminAccess ? [{ id: 'admin', label: 'Administration', icon: ShieldAlert }] : []),
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Key },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 min-h-[80vh] pb-12 relative">
      {/* Background Glows for Premium Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shadow-xl shadow-gray-200">
          <Settings size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your digital identity, workflows, and connectivity.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 space-y-2"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10 border border-blue-100/50' 
                  : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
              )}
              <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
              {tab.label}
              {tab.id === 'admin' && activeTab !== tab.id && <div className="absolute right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-9"
        >
          <AnimatePresence mode="wait">
            
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-2xl shadow-blue-900/5"
              >
                {/* Profile Photo Area */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-8 border-b border-gray-100">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                    <Avatar src={user?.profile_photo_url} size="xl" className="relative w-32 h-32 border-4 border-white shadow-xl" />
                    <label className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-white">
                      <Camera size={16} className="text-white" />
                      <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Primary Designation</p>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{user?.full_name || user?.username}</h2>
                    <p className="text-sm font-bold text-gray-500 mt-2 bg-gray-100 inline-block px-3 py-1 rounded-lg">@{user?.username}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs font-semibold text-gray-400">
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {user?.user_type?.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1.5"><Globe size={14} /> {user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">Professional Bio</label>
                    <textarea name="bio" value={form.bio} onChange={h} rows={3}
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
                      placeholder="Detail your trajectory..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">City Focus</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="city" value={form.city} onChange={h} placeholder="Primary local"
                          className="w-full pl-11 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">State Region</label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="state" value={form.state} onChange={h} placeholder="Territory"
                          className="w-full pl-11 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">Primary Contact</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input name="phone" value={form.phone} onChange={h} placeholder="Secure transmission number"
                        className="w-full pl-11 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSave} disabled={loading}
                      className="px-8 py-4 rounded-2xl font-black text-sm bg-gray-900 text-white shadow-xl shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Identity
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && hasAdminAccess && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Admin Platform Router Block */}
                {user.user_type === 'syllabrix_admin' && (
                  <div className="bg-gradient-to-br from-[#0a0a0f] to-[#12121a] rounded-[32px] p-10 shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div>
                         <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                            <Terminal size={28} className="text-violet-400" />
                         </div>
                         <h2 className="text-3xl font-black text-white tracking-tight mb-2">Central Platform Control</h2>
                         <p className="text-violet-200/50 text-sm font-medium leading-relaxed max-w-sm">
                           Access global moderation, enterprise commands, user intelligence, and raw system analytics.
                         </p>
                       </div>
                       <Link href="/admin" className="px-8 py-4 bg-white text-gray-900 hover:bg-violet-50 text-sm font-black rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] flex items-center gap-2 shrink-0 group">
                          Access Portal <LayoutDashboard size={16} className="group-hover:text-violet-600 transition-colors" />
                       </Link>
                    </div>
                  </div>
                )}
                
                {user.user_type === 'organization' && (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">L&D Management</p>
                      <h2 className="text-2xl font-black text-white leading-tight mb-2">Corporate Manager Suite</h2>
                      <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                        Navigate to your administrative workspace to trace employee impact, build AI learning pipelines, and map enterprise skills.
                      </p>
                    </div>
                    <Link href="/corporate/dashboard" className="relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/20 whitespace-nowrap">
                      Open Command Center
                    </Link>
                  </div>
                )}
                
                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[32px] p-8 shadow-xl shadow-gray-200/20">
                  <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2"><Key size={16} className="text-gray-400" /> Administrative Constraints</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl">
                    All administrative actions, configuration adjustments, and user identity sweeps are logged to the central ledger via your operational `SYLLABRIX_JWT`.
                  </p>
                </div>
              </motion.div>
            )}

            {(activeTab === 'preferences' || activeTab === 'security') && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-[400px] bg-gray-50/50 rounded-[32px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                  {activeTab === 'preferences' ? <Globe size={28} className="text-gray-300" /> : <Key size={28} className="text-gray-300" />}
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Under Construction</h3>
                <p className="text-sm text-gray-500 font-medium mt-2">The {activeTab} engine is currently being provisioned.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
