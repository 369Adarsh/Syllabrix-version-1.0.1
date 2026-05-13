/**
 * Platform Mode Detection
 *
 * Determines which adaptive persona/mode a student is in.
 * Priority order:
 *   1. Curriculum map (class + board + stream) — most specific
 *   2. Coaching exam target
 *   3. Age-group fallback
 *
 * Modes: young_explorer | curious_mind | board_warrior | exam_command | upsc_aspirant | skill_builder | default
 */

import { resolveStudentCurriculum } from '@/data/curriculum-map';

const UPSC_EXAMS = ['upsc', 'psc', 'ias', 'ips', 'ssc', 'banking', 'ibps', 'rrb', 'defence', 'nda', 'cds', 'capf'];

export function getPlatformMode(user) {
  if (!user) return 'default';

  const userType = user.user_type || 'student';
  if (userType !== 'student') return 'default';

  // Curriculum map is the primary signal
  const curriculum = resolveStudentCurriculum(user.profile);
  if (curriculum && curriculum.platformMode && curriculum.platformMode !== 'default') {
    return curriculum.platformMode;
  }

  // Direct class-number guard — runs before age_group to prevent e.g. a 16yo Class 10
  // student from being misclassified as exam_command just because of their age_group.
  const rawClass = parseInt(user.profile?.class_name, 10);
  if (!isNaN(rawClass)) {
    if (rawClass <= 5)  return 'young_explorer';
    if (rawClass <= 8)  return 'curious_mind';
    if (rawClass <= 10) return 'board_warrior';
    // Class 11-12: curriculum map already resolved above; fall through to exam fallbacks
  }

  // Fallback: target_exam string
  const targetExam = (user.profile?.target_exam || '').toLowerCase();
  if (UPSC_EXAMS.some(k => targetExam.includes(k))) return 'upsc_aspirant';
  if (targetExam.includes('jee') || targetExam.includes('neet')) return 'exam_command';

  // Fallback: age_group
  const ageGroup = user.age_group || '18+';
  if (ageGroup === '5-7' || ageGroup === '8-10') return 'young_explorer';
  if (ageGroup === '11-13') return 'curious_mind';
  if (ageGroup === '14-15') return 'board_warrior';
  if (ageGroup === '16-17') return 'exam_command';

  return 'skill_builder';
}

export const PLATFORM_MODES = {
  young_explorer: {
    label: 'Young Explorer',
    emoji: '🌈',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    sidebarActive: 'bg-amber-50 text-amber-700',
    sidebarActiveIcon: 'text-amber-600',
    primaryColor: '#F59E0B',
    bgColor: 'bg-amber-500',
    tagline: 'Learn, play and grow!',
  },
  curious_mind: {
    label: 'Curious Mind',
    emoji: '🔭',
    gradient: 'linear-gradient(135deg, #0D9488, #0891B2)',
    sidebarActive: 'bg-teal-50 text-teal-700',
    sidebarActiveIcon: 'text-teal-600',
    primaryColor: '#0D9488',
    bgColor: 'bg-teal-500',
    tagline: 'Discover something amazing today',
  },
  board_warrior: {
    label: 'Board Warrior',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #059669, #16A34A)',
    sidebarActive: 'bg-emerald-50 text-emerald-700',
    sidebarActiveIcon: 'text-emerald-600',
    primaryColor: '#059669',
    bgColor: 'bg-emerald-600',
    tagline: 'Boards are close — stay focused',
  },
  exam_command: {
    label: 'Exam Command',
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, #042C53, #185FA5)',
    sidebarActive: 'bg-blue-50 text-blue-600',
    sidebarActiveIcon: 'text-blue-600',
    primaryColor: '#2563EB',
    bgColor: 'bg-blue-600',
    tagline: 'Your exam. Your command.',
  },
  upsc_aspirant: {
    label: 'UPSC Aspirant',
    emoji: '🏛️',
    gradient: 'linear-gradient(135deg, #1E3A5F, #92400E)',
    sidebarActive: 'bg-sky-50 text-sky-900',
    sidebarActiveIcon: 'text-sky-800',
    primaryColor: '#1E3A5F',
    bgColor: 'bg-sky-900',
    tagline: 'Every day counts on this journey',
  },
  skill_builder: {
    label: 'Skill Builder',
    emoji: '💼',
    gradient: 'linear-gradient(135deg, #334155, #7C3AED)',
    sidebarActive: 'bg-violet-50 text-violet-700',
    sidebarActiveIcon: 'text-violet-600',
    primaryColor: '#7C3AED',
    bgColor: 'bg-violet-600',
    tagline: 'Build skills that matter',
  },
  default: {
    label: 'Student',
    emoji: '📚',
    gradient: 'linear-gradient(135deg, #042C53, #185FA5)',
    sidebarActive: 'bg-blue-50 text-blue-600',
    sidebarActiveIcon: 'text-blue-600',
    primaryColor: '#2563EB',
    bgColor: 'bg-blue-600',
    tagline: 'Welcome to Syllabrix',
  },
};

export function getModeTheme(user) {
  const mode = getPlatformMode(user);
  return { mode, ...PLATFORM_MODES[mode] };
}
