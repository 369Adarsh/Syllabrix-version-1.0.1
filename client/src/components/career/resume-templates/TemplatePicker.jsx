'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from './index';

// Mini A4 thumbnail — just color blocks representing the layout
function LayoutPreview({ template, size = 80 }) {
  const { layout, colors } = template;
  const h = size * 1.414; // A4 ratio

  const common = { width: size, height: h, borderRadius: 4, overflow: 'hidden', position: 'relative', background: colors.bg || '#ffffff', border: '1px solid #e5e7eb' };

  if (layout === 'classic') return (
    <div style={common}>
      <div style={{ height: h * 0.18, background: colors.primary, display: 'flex', alignItems: 'flex-end', padding: '0 6px 4px' }}>
        <div style={{ width: '60%', height: 4, borderRadius: 2, background: '#ffffff80' }} />
      </div>
      <div style={{ padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ height: 2, width: '90%', background: colors.rule || '#E5E7EB', borderRadius: 1 }} />
        {[70, 85, 60, 75, 55].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: '#E5E7EB', borderRadius: 1 }} />
        ))}
        <div style={{ height: 2, width: '90%', background: colors.rule || '#E5E7EB', borderRadius: 1, marginTop: 3 }} />
        {[80, 65, 70].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  if (layout === 'sidebar-left') return (
    <div style={{ ...common, display: 'flex' }}>
      <div style={{ width: '32%', height: '100%', background: colors.sidebar || colors.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, gap: 3 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#ffffff40' }} />
        {[55, 70, 50, 60, 45].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, borderRadius: 1, background: '#ffffff30' }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: '5px 5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[75, 55, 80, 60, 70, 50, 65, 55, 75].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  if (layout === 'sidebar-right') return (
    <div style={{ ...common, display: 'flex' }}>
      <div style={{ flex: 1, padding: '5px 5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 8, width: '80%', background: colors.primary, borderRadius: 2, marginBottom: 3 }} />
        {[75, 55, 80, 60, 70, 50, 65, 55].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ width: '30%', height: '100%', background: colors.sidebar || '#F0F9FF', borderLeft: `2px solid ${colors.sidebarBorder || '#BAE6FD'}`, padding: '5px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[65, 80, 55, 70, 60, 50, 75, 45].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: colors.primary + '60', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  if (layout === 'minimal') return (
    <div style={common}>
      <div style={{ padding: '6px 8px', borderBottom: `1px solid ${colors.rule || '#E5E7EB'}` }}>
        <div style={{ height: 5, width: '50%', background: colors.primary, borderRadius: 2, marginBottom: 3 }} />
        <div style={{ height: 2, width: '75%', background: '#D1D5DB', borderRadius: 1 }} />
      </div>
      <div style={{ padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[70, 85, 60, 75, 50, 80, 65, 55].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: i % 4 === 0 ? (colors.accent + '80') : '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  if (layout === 'two-col') return (
    <div style={{ ...common, display: 'flex' }}>
      <div style={{ width: '50%', height: '100%', background: colors.left || '#EFF6FF', padding: '5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 4, width: '70%', background: colors.primary, borderRadius: 2, marginBottom: 2 }} />
        {[65, 80, 55, 70, 60, 50, 75, 45, 65].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: colors.primary + '40', borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: '5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 4, width: '60%', background: '#D1D5DB', borderRadius: 2, marginBottom: 2 }} />
        {[75, 55, 80, 60, 70, 50, 65, 55, 75].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  if (layout === 'bold-header') return (
    <div style={common}>
      <div style={{ height: h * 0.22, background: colors.header || colors.primary, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 6px', gap: 3 }}>
        <div style={{ height: 5, width: '55%', background: '#ffffff', borderRadius: 2, opacity: 0.9 }} />
        <div style={{ height: 2, width: '70%', background: '#ffffff60', borderRadius: 1 }} />
        <div style={{ height: 2, width: '45%', background: '#ffffff40', borderRadius: 1 }} />
      </div>
      <div style={{ padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[80, 65, 70, 55, 75, 60, 50, 70].map((w, i) => (
          <div key={i} style={{ height: 2, width: `${w}%`, background: i % 4 === 0 ? (colors.accent + '80') : '#E5E7EB', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );

  return <div style={common} />;
}

export default function TemplatePicker({ selected, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
            activeCategory === 'All'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({TEMPLATES.length})
        </button>
        {TEMPLATE_CATEGORIES.map(cat => {
          const count = TEMPLATES.filter(t => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filtered.map(tpl => {
          const isSelected = selected?.id === tpl.id;
          return (
            <motion.button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              {/* Template thumbnail */}
              <LayoutPreview template={tpl} size={80} />

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Template name */}
              <p className="text-[10px] font-black text-gray-700 text-center leading-tight px-1">{tpl.name}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
