'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Camera, Settings, Star, TrendingUp, 
  MapPin, UserCheck, ShieldCheck, Zap
} from 'lucide-react';

export default function ProfileHeaderWidget({ user, stats, type = 'student' }) {
  const profile = user?.profile || {};
  const name = profile.full_name || user?.username || 'Learner';
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  
  // Custom styles based on role
  const themes = {
    student: {
      bg: 'linear-gradient(135deg, #E6F1FB 0%, #EEEDFE 100%)',
      accent: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700',
      icon: <Star size={16} className="text-amber-500" />
    },
    professional_learner: {
      bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      accent: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700',
      icon: <TrendingUp size={16} className="text-purple-600" />
    },
    parent: {
      bg: 'linear-gradient(135deg, #E1F5EE 0%, #E6F1FB 100%)',
      accent: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: <ShieldCheck size={16} className="text-emerald-600" />
    }
  };

  const theme = themes[type] || themes.student;
  
  // Derived stats
  const followersCount = stats?.followers || profile.followers_count || 0;
  const followingCount = stats?.following || profile.following_count || 0;
  const postsCount = stats?.posts || profile.posts_count || 0;
  const score = user?.syllabrix_score || profile.syllabrix_score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-gray-100 group shadow-sm transition-all hover:shadow-md"
      style={{ background: theme.bg }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/30 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -ml-8 -mb-8" />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* Identity Section */}
          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-inner border border-gray-100 overflow-hidden">
                {hasPhoto ? (
                  <Image src={user.profile_photo_url} alt={name} width={80} height={80} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl font-black text-2xl text-gray-400">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <Link href="/profile" className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                <Camera size={14} />
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">{name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${theme.badge}`}>
                  {type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 font-medium line-clamp-1 max-w-[200px] sm:max-w-none">
                {user.bio || profile.bio || 'Building future skills on Syllabrix'}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
                  <UserCheck size={12} className="text-gray-400" />
                  <span>{followersCount} followers</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
                  <Zap size={12} className="text-gray-400" />
                  <span>{postsCount} posts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats / Action Section */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            {score > 0 && (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/50 flex flex-col items-center">
                <div className="flex items-center gap-1">
                  {theme.icon}
                  <span className="text-xl font-black text-gray-800 leading-none">{Math.floor(score)}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
              </div>
            )}
            
            <Link 
              href="/settings"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all shadow-sm border border-gray-100 hover:shadow-md"
            >
              <Settings size={18} />
            </Link>
          </div>

        </div>

        {/* Progress Bar (Example Profile Strength) */}
        {!user.profile_completed && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <span>Profile Strength</span>
              <span className={theme.accent}>{profile.strength || 65}%</span>
            </div>
            <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${profile.strength || 65}%` }}
                className={`h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
