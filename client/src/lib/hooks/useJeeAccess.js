import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';

export const useJeeAccess = () => {
  const { user } = useAuth();
  
  // Revised Freemium Model:
  // - Free: Syllabus, Notes, Formula Sheets, NCERT, 5 AI Doubts/day, Recent PYQs (Last 5 years)
  // - Pro: Everything in Free + All Reference Books (HC Verma, etc.), 30-Year PYQ Archive, 50 AI Doubts/day
  // - Elite: Everything in Pro + Human Teacher Backup (10/mo), Direct Doubt Escalation
  
  const tier = user?.subscription_tier || 'free'; // default to free
  const isPro = ['pro', 'elite', 'admin'].includes(tier.toLowerCase());
  const isElite = ['elite', 'admin'].includes(tier.toLowerCase());

  const checkAccess = (feature) => {
    if (feature === 'books' || feature === 'pyq_archive') return isPro;
    if (feature === 'teacher_doubt') return isElite;
    return true; // most things are free now
  };

  return {
    tier,
    isPro,
    isElite,
    checkAccess,
    upgradeUrl: '/jee-command/subscription'
  };
};
