// 30 Resume Templates — 6 layouts × 5 color variations each
// Each template is a config object; the renderer switches on `layout`

export const TEMPLATE_CATEGORIES = ['Classic', 'Executive', 'Modern', 'Minimal', 'Split', 'Impact'];

export const TEMPLATES = [
  // ── CLASSIC (full-width header, vertical sections) ────────────────────────
  {
    id: 'classic-navy',     name: 'Classic Navy',     category: 'Classic', layout: 'classic',
    preview: '#1E3A5F',
    colors: { primary: '#1E3A5F', accent: '#2563EB', rule: '#DBEAFE', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'classic-charcoal', name: 'Classic Charcoal', category: 'Classic', layout: 'classic',
    preview: '#1F2937',
    colors: { primary: '#1F2937', accent: '#374151', rule: '#E5E7EB', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'classic-emerald',  name: 'Classic Emerald',  category: 'Classic', layout: 'classic',
    preview: '#065F46',
    colors: { primary: '#065F46', accent: '#059669', rule: '#D1FAE5', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'classic-burgundy', name: 'Classic Burgundy', category: 'Classic', layout: 'classic',
    preview: '#7F1D1D',
    colors: { primary: '#7F1D1D', accent: '#B91C1C', rule: '#FEE2E2', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'classic-violet',   name: 'Classic Violet',   category: 'Classic', layout: 'classic',
    preview: '#4C1D95',
    colors: { primary: '#4C1D95', accent: '#7C3AED', rule: '#EDE9FE', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },

  // ── EXECUTIVE (dark sidebar left, white main) ─────────────────────────────
  {
    id: 'exec-navy',   name: 'Executive Navy',   category: 'Executive', layout: 'sidebar-left',
    preview: '#0F172A',
    colors: { primary: '#0F172A', accent: '#3B82F6', sidebar: '#0F172A', sidebarText: '#F1F5F9', sidebarMuted: '#94A3B8', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'exec-slate',  name: 'Executive Slate',  category: 'Executive', layout: 'sidebar-left',
    preview: '#1E293B',
    colors: { primary: '#1E293B', accent: '#64748B', sidebar: '#1E293B', sidebarText: '#F8FAFC', sidebarMuted: '#CBD5E1', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'exec-emerald',name: 'Executive Emerald',category: 'Executive', layout: 'sidebar-left',
    preview: '#064E3B',
    colors: { primary: '#064E3B', accent: '#10B981', sidebar: '#064E3B', sidebarText: '#ECFDF5', sidebarMuted: '#6EE7B7', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'exec-purple', name: 'Executive Purple', category: 'Executive', layout: 'sidebar-left',
    preview: '#3B0764',
    colors: { primary: '#3B0764', accent: '#A855F7', sidebar: '#3B0764', sidebarText: '#FAF5FF', sidebarMuted: '#D8B4FE', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'exec-crimson',name: 'Executive Crimson',category: 'Executive', layout: 'sidebar-left',
    preview: '#7F1D1D',
    colors: { primary: '#7F1D1D', accent: '#EF4444', sidebar: '#7F1D1D', sidebarText: '#FEF2F2', sidebarMuted: '#FCA5A5', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },

  // ── MODERN (light sidebar right) ─────────────────────────────────────────
  {
    id: 'modern-sky',    name: 'Modern Sky',    category: 'Modern', layout: 'sidebar-right',
    preview: '#0EA5E9',
    colors: { primary: '#0369A1', accent: '#0EA5E9', sidebar: '#F0F9FF', sidebarBorder: '#BAE6FD', sidebarText: '#0C4A6E', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'modern-teal',   name: 'Modern Teal',   category: 'Modern', layout: 'sidebar-right',
    preview: '#0D9488',
    colors: { primary: '#0F766E', accent: '#0D9488', sidebar: '#F0FDFA', sidebarBorder: '#99F6E4', sidebarText: '#134E4A', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'modern-violet', name: 'Modern Violet', category: 'Modern', layout: 'sidebar-right',
    preview: '#7C3AED',
    colors: { primary: '#6D28D9', accent: '#7C3AED', sidebar: '#F5F3FF', sidebarBorder: '#DDD6FE', sidebarText: '#2E1065', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'modern-rose',   name: 'Modern Rose',   category: 'Modern', layout: 'sidebar-right',
    preview: '#E11D48',
    colors: { primary: '#BE123C', accent: '#E11D48', sidebar: '#FFF1F2', sidebarBorder: '#FECDD3', sidebarText: '#881337', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'modern-amber',  name: 'Modern Amber',  category: 'Modern', layout: 'sidebar-right',
    preview: '#D97706',
    colors: { primary: '#B45309', accent: '#D97706', sidebar: '#FFFBEB', sidebarBorder: '#FDE68A', sidebarText: '#78350F', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },

  // ── MINIMAL (all-white, hairline rules) ──────────────────────────────────
  {
    id: 'minimal-white',  name: 'Minimal White',  category: 'Minimal', layout: 'minimal',
    preview: '#2563EB',
    colors: { primary: '#2563EB', accent: '#2563EB', rule: '#E5E7EB', text: '#111827', muted: '#9CA3AF', bg: '#ffffff' },
  },
  {
    id: 'minimal-warm',   name: 'Minimal Warm',   category: 'Minimal', layout: 'minimal',
    preview: '#92400E',
    colors: { primary: '#92400E', accent: '#D97706', rule: '#E7E5E4', text: '#1C1917', muted: '#A8A29E', bg: '#FFFAF5' },
  },
  {
    id: 'minimal-mono',   name: 'Minimal Mono',   category: 'Minimal', layout: 'minimal',
    preview: '#111827',
    colors: { primary: '#111827', accent: '#374151', rule: '#D1D5DB', text: '#111827', muted: '#9CA3AF', bg: '#ffffff' },
  },
  {
    id: 'minimal-teal',   name: 'Minimal Teal',   category: 'Minimal', layout: 'minimal',
    preview: '#0F766E',
    colors: { primary: '#0F766E', accent: '#14B8A6', rule: '#CCFBF1', text: '#111827', muted: '#9CA3AF', bg: '#F0FDFA' },
  },
  {
    id: 'minimal-slate',  name: 'Minimal Slate',  category: 'Minimal', layout: 'minimal',
    preview: '#475569',
    colors: { primary: '#334155', accent: '#475569', rule: '#CBD5E1', text: '#1E293B', muted: '#94A3B8', bg: '#F8FAFC' },
  },

  // ── SPLIT (two equal columns) ─────────────────────────────────────────────
  {
    id: 'split-blue',    name: 'Split Blue',    category: 'Split', layout: 'two-col',
    preview: '#2563EB',
    colors: { primary: '#2563EB', accent: '#1D4ED8', left: '#EFF6FF', right: '#ffffff', text: '#111827', muted: '#6B7280' },
  },
  {
    id: 'split-indigo',  name: 'Split Indigo',  category: 'Split', layout: 'two-col',
    preview: '#4338CA',
    colors: { primary: '#4338CA', accent: '#4F46E5', left: '#EEF2FF', right: '#ffffff', text: '#111827', muted: '#6B7280' },
  },
  {
    id: 'split-green',   name: 'Split Green',   category: 'Split', layout: 'two-col',
    preview: '#15803D',
    colors: { primary: '#15803D', accent: '#16A34A', left: '#F0FDF4', right: '#ffffff', text: '#111827', muted: '#6B7280' },
  },
  {
    id: 'split-gray',    name: 'Split Gray',    category: 'Split', layout: 'two-col',
    preview: '#374151',
    colors: { primary: '#374151', accent: '#1F2937', left: '#F9FAFB', right: '#ffffff', text: '#111827', muted: '#6B7280' },
  },
  {
    id: 'split-purple',  name: 'Split Purple',  category: 'Split', layout: 'two-col',
    preview: '#7E22CE',
    colors: { primary: '#7E22CE', accent: '#9333EA', left: '#FAF5FF', right: '#ffffff', text: '#111827', muted: '#6B7280' },
  },

  // ── IMPACT (bold full-bleed color header, white body) ────────────────────
  {
    id: 'impact-blue',    name: 'Impact Blue',    category: 'Impact', layout: 'bold-header',
    preview: '#2563EB',
    colors: { header: '#2563EB', headerText: '#ffffff', accent: '#1D4ED8', rule: '#DBEAFE', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'impact-indigo',  name: 'Impact Indigo',  category: 'Impact', layout: 'bold-header',
    preview: '#4338CA',
    colors: { header: '#312E81', headerText: '#ffffff', accent: '#4338CA', rule: '#E0E7FF', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'impact-slate',   name: 'Impact Slate',   category: 'Impact', layout: 'bold-header',
    preview: '#0F172A',
    colors: { header: '#0F172A', headerText: '#ffffff', accent: '#334155', rule: '#E2E8F0', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'impact-emerald', name: 'Impact Emerald', category: 'Impact', layout: 'bold-header',
    preview: '#065F46',
    colors: { header: '#064E3B', headerText: '#ffffff', accent: '#059669', rule: '#D1FAE5', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
  {
    id: 'impact-rose',    name: 'Impact Rose',    category: 'Impact', layout: 'bold-header',
    preview: '#BE123C',
    colors: { header: '#881337', headerText: '#ffffff', accent: '#BE123C', rule: '#FFE4E6', text: '#111827', muted: '#6B7280', bg: '#ffffff' },
  },
];
