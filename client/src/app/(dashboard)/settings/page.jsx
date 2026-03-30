'use client';
import { useState } from 'react';
import { FadeIn, SlideUp } from '@/components/ui/Animate';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api/profile.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Avatar from '@/components/ui/Avatar';
import { Camera, Save, Settings, Loader2, User, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ bio: user?.bio || '', city: user?.city || '', state: user?.state || '', phone: user?.phone || '' });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try { await profileAPI.update(form); await refreshUser(); toast.success('Profile updated!'); }
    catch { toast.error('Failed to update'); } finally { setLoading(false); }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated!'); }
    catch { toast.error('Upload failed'); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <FadeIn className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center shadow-sm"><Settings size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Settings</h1><p className="text-[11px] text-gray-400">Manage your profile and preferences</p></div>
      </FadeIn>

      <SlideUp delay={0.05}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <Avatar src={user?.profile_photo_url} size="xl" />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-800">{user?.username}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.user_type} · {user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Bio</label>
            <textarea name="bio" value={form.bio} onChange={h} rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="Tell us about yourself..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">City</label>
              <div className="relative"><MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="city" value={form.city} onChange={h} placeholder="Your city"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" /></div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">State</label>
              <input name="state" value={form.state} onChange={h} placeholder="Your state"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Phone</label>
            <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="phone" value={form.phone} onChange={h} placeholder="10-digit number"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" /></div>
          </div>
          <button onClick={handleSave} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/40 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </button>
        </div>
      </div>
      </SlideUp>
    </div>
  );
}
