'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Spinner from '@/components/ui/Spinner';
import {
  Brain, Sparkles, RefreshCw, ZoomIn, ZoomOut, ChevronDown, ChevronRight,
  BookOpen, Lightbulb, HelpCircle, GraduationCap, Target, X, ArrowRight,
  Layers, Clock, CheckCircle, FileText, Loader2, GitBranch, MessageCircle,
  Download, ArrowDown, Send, Shapes, BookMarked, FlaskConical, PenLine
} from 'lucide-react';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════════
const CLASS_OPTIONS = [
  { value: '', label: 'Select Class' },
  ...['6','7','8','9','10','11','12'].map(c => ({ value: c, label: `Class ${c}` })),
];

const BOARD_OPTIONS = [
  { value: '', label: 'Select Board' },
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE' },
  { value: 'State Board', label: 'State Board' },
  { value: 'IB', label: 'IB' },
  { value: 'IGCSE', label: 'IGCSE' },
];

const GOAL_OPTIONS = [
  { value: 'understand', label: 'Understand', icon: Lightbulb },
  { value: 'exam', label: 'Exam Prep', icon: Target },
  { value: 'revision', label: 'Revision', icon: RefreshCw },
  { value: 'project', label: 'Project', icon: FileText },
];

const QUICK_TOPICS = [
  { label: 'Photosynthesis', emoji: '🌿' },
  { label: 'Indian Constitution', emoji: '📜' },
  { label: 'Solar System', emoji: '🪐' },
  { label: 'Machine Learning', emoji: '🤖' },
  { label: 'Human Digestive System', emoji: '🫁' },
  { label: 'DNA and Genetics', emoji: '🧬' },
  { label: "Newton's Laws", emoji: '🍎' },
  { label: 'Periodic Table', emoji: '⚗️' },
  { label: 'Climate Change', emoji: '🌡️' },
  { label: 'Indian Economy', emoji: '💹' },
];

// ════════════════════════════════════════════════════════════
//  SMALL COMPONENTS
// ════════════════════════════════════════════════════════════
function Select({ value, onChange, options, icon: Icon, label, loading: isLoading, disabled }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon size={14} className="text-gray-400" /></div>}
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled || isLoading}
          className={`w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-9' : 'pl-3.5'}`}>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {isLoading
          ? <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
          : <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MIND MAP SVG RENDERER (radial tree)
// ════════════════════════════════════════════════════════════
function MindMapNode({ node, x, y, angle, radius, depth, onNodeClick, selectedId }) {
  if (!node) return null;
  const isCenter = depth === 0;
  const nw = isCenter ? 170 : depth === 1 ? 145 : 115;
  const nh = isCenter ? 52 : depth === 1 ? 40 : 32;
  const fs = isCenter ? 13.5 : depth === 1 ? 11.5 : 10.5;
  const color = node.color || '#6366F1';
  const children = node.children || [];
  const isSel = selectedId === node.title;
  const spread = depth === 0 ? 360 : Math.min(130, 55 * children.length);
  const cRad = depth === 0 ? radius : radius * 0.72;
  const startA = angle - spread / 2;
  const label = (node.title || '').length > 22 ? node.title.slice(0, 20) + '…' : node.title;

  return (
    <g>
      {children.map((child, i) => {
        const ca = children.length === 1 ? angle : startA + (spread / (children.length - 1 || 1)) * i;
        const rad = (ca * Math.PI) / 180;
        const cx = x + Math.cos(rad) * cRad;
        const cy = y + Math.sin(rad) * cRad;
        const cX = (x + cx) / 2 + (cy - y) * 0.18;
        const cY = (y + cy) / 2 - (cx - x) * 0.18;
        return (
          <g key={i}>
            <path d={`M ${x} ${y} Q ${cX} ${cY} ${cx} ${cy}`} fill="none"
              stroke={child.color || color} strokeWidth={depth === 0 ? 2.5 : 1.8} strokeOpacity={0.35} className="animate-draw" />
            <MindMapNode node={child} x={cx} y={cy} angle={ca} radius={cRad}
              depth={depth + 1} onNodeClick={onNodeClick} selectedId={selectedId} />
          </g>
        );
      })}
      <g onClick={() => onNodeClick?.(node)} className="cursor-pointer"
        style={{ animation: `fadeScale 0.5s ease-out ${depth * 0.12}s both` }}>
        {isSel && <rect x={x - nw/2 - 4} y={y - nh/2 - 4} width={nw+8} height={nh+8} rx={(nh+8)/2}
          fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.5} className="animate-pulse" />}
        <rect x={x - nw/2} y={y - nh/2} width={nw} height={nh} rx={nh/2}
          fill={isCenter ? color : depth === 1 ? color : `${color}18`}
          stroke={isCenter ? color : `${color}60`} strokeWidth={isCenter ? 2.5 : 1.2}
          filter={isCenter ? 'url(#shadow)' : undefined} className="transition-all duration-200" />
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
          fontSize={fs} fontWeight={isCenter ? 700 : depth === 1 ? 600 : 500}
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fill={depth > 1 ? color : '#FFFFFF'} className="pointer-events-none select-none">{label}</text>
      </g>
    </g>
  );
}

// ════════════════════════════════════════════════════════════
//  FLOWCHART SVG RENDERER (top-to-bottom)
// ════════════════════════════════════════════════════════════
function FlowchartRenderer({ data, onNodeClick }) {
  if (!data?.nodes) return null;
  const nodes = data.nodes;
  const connections = data.connections || [];

  // Layout: calculate positions
  const colW = 280;
  const rowH = 100;
  const startX = 600;
  const startY = 50;
  const positions = {};

  // Simple top-to-bottom layout
  let mainY = startY;
  const mainNodes = [];
  const branchNodes = [];

  nodes.forEach((n, i) => {
    if (n.branches) {
      // Decision node — branches go left/right
      positions[n.id] = { x: startX, y: mainY };
      mainY += rowH;
      let bx = startX - colW;
      n.branches.forEach(b => {
        const targetNode = nodes.find(nn => nn.id === b.target);
        if (targetNode && !positions[targetNode.id]) {
          positions[targetNode.id] = { x: bx, y: mainY };
          branchNodes.push(targetNode.id);
          bx += colW * 2;
        }
      });
      mainY += rowH;
    } else if (!positions[n.id]) {
      positions[n.id] = { x: startX, y: mainY };
      mainNodes.push(n.id);
      mainY += rowH;
    }
  });

  const totalH = mainY + 40;
  const nw = 220;
  const nh = 56;

  const getShape = (type) => {
    if (type === 'decision') return 'diamond';
    if (type === 'start' || type === 'end') return 'rounded';
    return 'rect';
  };

  return (
    <svg viewBox={`0 0 1200 ${totalH}`} width={1200} height={totalH} className="mx-auto">
      <defs>
        <filter id="fShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000012" />
        </filter>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
        </marker>
        <style>{`
          @keyframes fadeScale { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
          .animate-draw { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 0.6s ease-out forwards; }
          @keyframes drawLine { to { stroke-dashoffset: 0; } }
        `}</style>
      </defs>
      <pattern id="fDots" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="0.6" fill="#D1D5DB" fillOpacity="0.4" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#fDots)" />

      {/* Connections */}
      {connections.map((c, i) => {
        const from = positions[c.from];
        const to = positions[c.to];
        if (!from || !to) return null;
        const fromY = from.y + nh / 2;
        const toY = to.y - nh / 2;
        const midY = (fromY + toY) / 2;
        return (
          <g key={i}>
            <path d={`M ${from.x} ${fromY} C ${from.x} ${midY} ${to.x} ${midY} ${to.x} ${toY}`}
              fill="none" stroke="#94A3B8" strokeWidth={1.8} markerEnd="url(#arrowhead)" className="animate-draw" />
            {c.label && (
              <text x={(from.x + to.x) / 2 + (from.x === to.x ? 14 : 0)} y={midY - 4}
                fontSize={10} fill="#6B7280" textAnchor="middle" fontWeight={600}
                fontFamily="'Plus Jakarta Sans', system-ui">{c.label}</text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const pos = positions[n.id];
        if (!pos) return null;
        const shape = getShape(n.type);
        const color = n.color || '#6366F1';
        return (
          <g key={n.id} onClick={() => onNodeClick?.(n)} className="cursor-pointer"
            style={{ animation: `fadeScale 0.4s ease-out ${i * 0.08}s both` }}>
            {shape === 'diamond' ? (
              <g transform={`translate(${pos.x}, ${pos.y})`}>
                <polygon points={`0,${-nh/2} ${nw/2.5},0 0,${nh/2} ${-nw/2.5},0`}
                  fill={color} stroke={`${color}80`} strokeWidth={1.5} filter="url(#fShadow)" />
                <text x={0} y={2} textAnchor="middle" dominantBaseline="central"
                  fontSize={11} fontWeight={600} fill="#FFFFFF"
                  fontFamily="'Plus Jakarta Sans', system-ui" className="pointer-events-none">
                  {(n.label || '').length > 24 ? n.label.slice(0, 22) + '…' : n.label}
                </text>
              </g>
            ) : (
              <g>
                <rect x={pos.x - nw/2} y={pos.y - nh/2} width={nw} height={nh}
                  rx={shape === 'rounded' ? nh/2 : 14}
                  fill={n.type === 'start' || n.type === 'end' ? color : `${color}15`}
                  stroke={color} strokeWidth={n.type === 'start' || n.type === 'end' ? 2 : 1.2}
                  filter="url(#fShadow)" />
                <text x={pos.x} y={pos.y - 6} textAnchor="middle" dominantBaseline="central"
                  fontSize={11.5} fontWeight={600}
                  fill={n.type === 'start' || n.type === 'end' ? '#FFFFFF' : color}
                  fontFamily="'Plus Jakarta Sans', system-ui" className="pointer-events-none">
                  {(n.label || '').length > 26 ? n.label.slice(0, 24) + '…' : n.label}
                </text>
                {n.detail && (
                  <text x={pos.x} y={pos.y + 10} textAnchor="middle" dominantBaseline="central"
                    fontSize={9} fill="#6B7280" fontFamily="'Plus Jakarta Sans', system-ui"
                    className="pointer-events-none">
                    {n.detail.length > 36 ? n.detail.slice(0, 34) + '…' : n.detail}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
//  DOUBT DIAGRAM RENDERER (concept map)
// ════════════════════════════════════════════════════════════
function DiagramRenderer({ diagram }) {
  if (!diagram?.elements) return null;
  const els = diagram.elements;
  const arrows = diagram.arrows || [];
  const gridSize = 140;
  const cx = 400;
  const cy = 60;

  const getPos = (el) => ({
    x: cx + (el.x || 0) * gridSize,
    y: cy + (el.y || 0) * gridSize,
  });

  return (
    <svg viewBox="0 0 800 600" width={800} height={Math.max(400, (Math.max(...els.map(e => e.y || 0)) + 2) * gridSize)}
      className="mx-auto w-full">
      <defs>
        <marker id="dArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
        </marker>
        <style>{`@keyframes fadeScale { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }`}</style>
      </defs>

      {/* Arrows */}
      {arrows.map((a, i) => {
        const fromEl = els.find(e => e.id === a.from);
        const toEl = els.find(e => e.id === a.to);
        if (!fromEl || !toEl) return null;
        const from = getPos(fromEl);
        const to = getPos(toEl);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y + 22} x2={to.x} y2={to.y - 22}
              stroke="#94A3B8" strokeWidth={1.5} markerEnd="url(#dArrow)" strokeDasharray="6 3" />
            {a.label && <text x={midX + 8} y={midY} fontSize={9} fill="#6B7280"
              fontFamily="'Plus Jakarta Sans', system-ui" fontWeight={500}>{a.label}</text>}
          </g>
        );
      })}

      {/* Elements */}
      {els.map((el, i) => {
        const pos = getPos(el);
        const color = el.color || '#6366F1';
        const isCircle = el.type === 'circle';
        const w = isCircle ? 90 : 160;
        const h = isCircle ? 44 : 44;
        return (
          <g key={el.id} style={{ animation: `fadeScale 0.4s ease-out ${i * 0.1}s both` }}>
            {isCircle ? (
              <ellipse cx={pos.x} cy={pos.y} rx={w/2} ry={h/2}
                fill={`${color}18`} stroke={color} strokeWidth={1.5} />
            ) : (
              <rect x={pos.x - w/2} y={pos.y - h/2} width={w} height={h}
                rx={12} fill={`${color}15`} stroke={color} strokeWidth={1.5} />
            )}
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
              fontSize={10.5} fontWeight={600} fill={color}
              fontFamily="'Plus Jakarta Sans', system-ui" className="select-none">
              {(el.label || '').length > 20 ? el.label.slice(0, 18) + '…' : el.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
//  NOTES PANEL (side drawer)
// ════════════════════════════════════════════════════════════
function NotesPanel({ node, topic, classLevel, board, subject, onClose, onExpand }) {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!node) return;
    setLoading(true); setNotes(null);
    aiAPI.generateMindMapNotes(node.title || node.label, {
      class_level: classLevel || undefined, board: board || undefined,
      parent_topic: topic || undefined, subject: subject || undefined,
    })
      .then(res => setNotes(res.data?.data || res.data))
      .catch(() => toast.error('Could not load notes'))
      .finally(() => setLoading(false));
  }, [node, topic, classLevel, board, subject]);

  // PDF-friendly print
  const handleExportPDF = () => {
    if (!notes) return;
    const title = node?.title || node?.label || 'Notes';
    const win = window.open('', '_blank');
    if (!win) { toast.error('Please allow pop-ups'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>${title} — Syllabrix Notes</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:40px 50px;color:#1e293b;max-width:800px;margin:0 auto}
      h1{font-size:22px;color:#4F46E5;margin-bottom:4px}
      .meta{font-size:12px;color:#94a3b8;margin-bottom:24px}
      .section{margin-bottom:22px}
      .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#6366F1;margin-bottom:8px}
      .summary{background:#EEF2FF;padding:14px 16px;border-radius:12px;font-size:14px;line-height:1.6}
      .point{display:flex;gap:10px;padding:8px 12px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px;line-height:1.5}
      .point-num{width:22px;height:22px;border-radius:50%;background:#ECFDF5;color:#059669;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
      .term{background:#EFF6FF;padding:10px 14px;border-radius:10px;margin-bottom:6px}
      .term-name{font-weight:700;font-size:12px;color:#2563EB}
      .term-def{font-size:12px;color:#475569;margin-top:2px}
      .formula{background:#FFF7ED;padding:10px 14px;border-radius:10px;margin-bottom:6px}
      .formula-name{font-weight:700;font-size:12px;color:#EA580C}
      .formula-eq{font-family:monospace;font-size:14px;color:#1e293b;margin:4px 0}
      .formula-use{font-size:11px;color:#78716C}
      .question{display:flex;gap:8px;padding:8px 12px;background:#FFFBEB;border-radius:10px;margin-bottom:6px;font-size:13px}
      .q-label{color:#D97706;font-weight:700;font-size:12px;flex-shrink:0}
      .tip{background:linear-gradient(135deg,#FAF5FF,#FDF2F8);padding:14px 16px;border-radius:12px;font-size:13px;line-height:1.5}
      .tip-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9333EA;margin-bottom:6px}
      .diagram-hint{background:#F0FDF4;padding:12px 16px;border-radius:12px;font-size:13px;color:#166534;line-height:1.5;margin-bottom:6px}
      .footer{margin-top:30px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
      @media print{body{padding:20px 30px}}
    </style></head><body>
    <h1>${title}</h1>
    <div class="meta">${[classLevel && `Class ${classLevel}`, board, subject, topic && `Topic: ${topic}`].filter(Boolean).join(' · ')} — Generated by Syllabrix AI</div>
    ${notes.summary ? `<div class="section"><div class="section-title">Overview</div><div class="summary">${notes.summary}</div></div>` : ''}
    ${notes.points?.length ? `<div class="section"><div class="section-title">Key Points</div>${notes.points.map((p,i) => `<div class="point"><div class="point-num">${i+1}</div><div>${p}</div></div>`).join('')}</div>` : ''}
    ${notes.key_terms?.length ? `<div class="section"><div class="section-title">Key Terms</div>${notes.key_terms.map(t => `<div class="term"><div class="term-name">${t.term}</div><div class="term-def">${t.definition}</div></div>`).join('')}</div>` : ''}
    ${notes.formulas?.length ? `<div class="section"><div class="section-title">Formulas</div>${notes.formulas.map(f => `<div class="formula"><div class="formula-name">${f.name}</div><div class="formula-eq">${f.formula}</div><div class="formula-use">${f.when_to_use || ''}</div></div>`).join('')}</div>` : ''}
    ${notes.diagram_hint ? `<div class="section"><div class="section-title">Diagram Tip</div><div class="diagram-hint">📐 ${notes.diagram_hint}</div></div>` : ''}
    ${notes.questions?.length ? `<div class="section"><div class="section-title">Practice Questions</div>${notes.questions.map((q,i) => `<div class="question"><span class="q-label">Q${i+1}</span><span>${q}</span></div>`).join('')}</div>` : ''}
    ${notes.tip ? `<div class="section"><div class="tip"><div class="tip-label">✨ Pro Tip</div>${notes.tip}</div></div>` : ''}
    <div class="footer">Syllabrix — India's Education Ecosystem · syllabrix.com</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  if (!node) return null;
  const nodeLabel = node.title || node.label || 'Topic';

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${node.color || '#6366F1'}20` }}>
            <BookOpen size={18} style={{ color: node.color || '#6366F1' }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-sm truncate">{nodeLabel}</h3>
            <p className="text-[11px] text-gray-400">AI Study Notes</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {notes && (
            <button onClick={handleExportPDF} title="Export PDF"
              className="p-2 rounded-lg hover:bg-white/80 transition-colors">
              <Download size={16} className="text-indigo-500" />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/80 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4 animate-pulse">
              <Sparkles size={24} className="text-indigo-500" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">Generating study notes...</p>
            <Spinner className="mt-4" />
          </div>
        ) : notes ? (
          <>
            {notes.summary && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2 flex items-center gap-1.5"><Lightbulb size={12} /> Overview</p>
                <p className="text-sm text-gray-700 leading-relaxed">{notes.summary}</p>
              </div>
            )}
            {notes.points?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-500" /> Key Points</p>
                <div className="space-y-2">{notes.points.map((p, i) => (
                  <div key={i} className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{p}</p>
                  </div>
                ))}</div>
              </div>
            )}
            {notes.key_terms?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><BookOpen size={12} className="text-blue-500" /> Key Terms</p>
                <div className="space-y-2">{notes.key_terms.map((t, i) => (
                  <div key={i} className="bg-blue-50/60 rounded-xl p-3 border border-blue-100/40">
                    <p className="text-xs font-bold text-blue-700">{t.term}</p>
                    <p className="text-[12px] text-gray-600 mt-0.5">{t.definition}</p>
                  </div>
                ))}</div>
              </div>
            )}
            {notes.formulas?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><PenLine size={12} className="text-orange-500" /> Formulas</p>
                <div className="space-y-2">{notes.formulas.map((f, i) => (
                  <div key={i} className="bg-orange-50/60 rounded-xl p-3 border border-orange-100/40">
                    <p className="text-xs font-bold text-orange-700">{f.name}</p>
                    <p className="text-sm font-mono text-gray-800 mt-1">{f.formula}</p>
                    {f.when_to_use && <p className="text-[11px] text-gray-500 mt-1">{f.when_to_use}</p>}
                  </div>
                ))}</div>
              </div>
            )}
            {notes.diagram_hint && (
              <div className="bg-green-50/60 rounded-xl p-3.5 border border-green-100/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1.5 flex items-center gap-1.5"><Shapes size={12} /> Diagram Tip</p>
                <p className="text-[13px] text-gray-700">{notes.diagram_hint}</p>
              </div>
            )}
            {notes.questions?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><HelpCircle size={12} className="text-amber-500" /> Practice Questions</p>
                <div className="space-y-2">{notes.questions.map((q, i) => (
                  <div key={i} className="flex gap-2.5 bg-amber-50/60 rounded-xl p-3 border border-amber-100/40">
                    <span className="text-amber-500 font-bold text-xs mt-0.5">Q{i + 1}</span>
                    <p className="text-[13px] text-gray-700">{q}</p>
                  </div>
                ))}</div>
              </div>
            )}
            {notes.tip && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100/40">
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-1.5 flex items-center gap-1.5"><Sparkles size={12} /> Pro Tip</p>
                <p className="text-sm text-gray-700 leading-relaxed">{notes.tip}</p>
              </div>
            )}
          </>
        ) : <div className="text-center py-16"><p className="text-gray-400 text-sm">Could not load notes.</p></div>}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
        {notes && (
          <button onClick={handleExportPDF}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <Download size={14} /> Export PDF
          </button>
        )}
        <button onClick={() => { onClose(); onExpand(nodeLabel); }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
          <Brain size={14} /> Expand Map <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DOUBT PANEL (bottom drawer)
// ════════════════════════════════════════════════════════════
function DoubtPanel({ classLevel, board, subject, chapter, onClose }) {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) { toast.error('Type your question'); return; }
    setLoading(true); setResult(null);
    try {
      const res = await aiAPI.explainWithDiagram(question, {
        class_level: classLevel, board, subject, chapter,
      });
      setResult(res.data?.data || res.data);
    } catch { toast.error('Could not get explanation'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = () => {
    if (!result) return;
    const win = window.open('', '_blank');
    if (!win) { toast.error('Please allow pop-ups'); return; }
    win.document.write(`<!DOCTYPE html><html><head><title>Doubt — Syllabrix</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;padding:40px 50px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{font-size:20px;color:#4F46E5;margin-bottom:6px}h2{font-size:14px;color:#6366F1;margin:18px 0 8px}
    .answer{background:#EEF2FF;padding:16px;border-radius:12px;font-size:14px;line-height:1.7;margin-bottom:16px}
    .step{display:flex;gap:10px;padding:8px 12px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px}
    .step-num{width:22px;height:22px;border-radius:50%;background:#E0E7FF;color:#4F46E5;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .tip{background:#FFF7ED;padding:14px;border-radius:12px;font-size:13px;margin-top:16px}
    .footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8;text-align:center}</style></head><body>
    <h1>Doubt Clarification</h1>
    <p style="font-size:15px;color:#475569;margin-bottom:20px"><strong>Q:</strong> ${question}</p>
    <div class="answer">${result.answer}</div>
    ${result.steps?.length ? `<h2>Steps</h2>${result.steps.map((s,i) => `<div class="step"><div class="step-num">${i+1}</div><div>${s}</div></div>`).join('')}` : ''}
    ${result.formula ? `<h2>Formula</h2><div style="background:#FFF7ED;padding:12px 16px;border-radius:10px;font-family:monospace;font-size:15px">${result.formula}</div>` : ''}
    ${result.real_world_example ? `<h2>Real-World Example</h2><p style="font-size:13px;line-height:1.6">${result.real_world_example}</p>` : ''}
    ${result.exam_tip ? `<div class="tip"><strong>Exam Tip:</strong> ${result.exam_tip}</div>` : ''}
    <div class="footer">Syllabrix — India's Education Ecosystem · syllabrix.com</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-amber-600" />
          <h3 className="font-bold text-gray-800 text-sm">Ask a Doubt — AI will explain with a diagram</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/80"><X size={16} className="text-gray-400" /></button>
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="flex gap-2">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="Type your question... (e.g. Why does photosynthesis need sunlight?)"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
          <button onClick={ask} disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200/40 transition-all active:scale-[0.98] disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Ask
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-5 pb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Sparkles size={20} className="text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-gray-600">AI is preparing your explanation with a diagram...</p>
          <Spinner className="mt-3" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="px-5 pb-5 space-y-4">
          {/* Answer */}
          <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100/40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Answer</p>
            <p className="text-sm text-gray-700 leading-relaxed">{result.answer}</p>
          </div>

          {/* Steps */}
          {result.steps?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5"><ArrowDown size={12} className="text-blue-500" /> Step by Step</p>
              <div className="space-y-1.5">{result.steps.map((s, i) => (
                <div key={i} className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-[13px] text-gray-700">{s}</p>
                </div>
              ))}</div>
            </div>
          )}

          {/* Diagram */}
          {result.diagram && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5"><Shapes size={12} className="text-purple-500" /> Concept Diagram</p>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-auto p-2">
                <DiagramRenderer diagram={result.diagram} />
              </div>
            </div>
          )}

          {/* Formula */}
          {result.formula && result.formula !== 'null' && (
            <div className="bg-orange-50/60 rounded-xl p-3.5 border border-orange-100/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-1.5">Formula</p>
              <p className="text-base font-mono font-semibold text-gray-800">{result.formula}</p>
            </div>
          )}

          {/* Real world example */}
          {result.real_world_example && (
            <div className="bg-green-50/60 rounded-xl p-3.5 border border-green-100/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-green-600 mb-1.5">Real-World Example</p>
              <p className="text-[13px] text-gray-700 leading-relaxed">{result.real_world_example}</p>
            </div>
          )}

          {/* Exam tip */}
          {result.exam_tip && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3.5 border border-purple-100/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-1.5 flex items-center gap-1.5"><Sparkles size={12} /> Exam Tip</p>
              <p className="text-[13px] text-gray-700">{result.exam_tip}</p>
            </div>
          )}

          <button onClick={handleExportPDF}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
            <Download size={14} /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function MindMapPage() {
  const { user } = useAuth();

  // Curriculum state
  const [classLevel, setClassLevel] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [topicFromCurriculum, setTopicFromCurriculum] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [goal, setGoal] = useState('understand');

  // Loaded curriculum data (all from AI)
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('mindmap'); // mindmap | flowchart
  const [mindmap, setMindmap] = useState(null);
  const [flowchart, setFlowchart] = useState(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Panels
  const [selectedNode, setSelectedNode] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [doubtOpen, setDoubtOpen] = useState(false);

  // History
  const [history, setHistory] = useState([]);

  // ── Pre-fill from user profile ──
  useEffect(() => {
    if (user) {
      if (user.class_name) {
        const cn = user.class_name.toString().replace(/\D/g, '');
        if (cn && CLASS_OPTIONS.some(o => o.value === cn)) setClassLevel(cn);
      }
      if (user.board && BOARD_OPTIONS.some(o => o.value === user.board)) setBoard(user.board);
    }
  }, [user]);

  // ── Load subjects when class changes ──
  useEffect(() => {
    if (!classLevel) { setSubjects([]); setSubject(''); return; }
    setLoadingSubjects(true);
    aiAPI.getSubjects(classLevel)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
    setSubject(''); setChapter(''); setTopicFromCurriculum('');
    setChapters([]); setTopics([]);
  }, [classLevel]);

  // ── Load chapters when subject changes ──
  useEffect(() => {
    if (!classLevel || !subject) { setChapters([]); setChapter(''); return; }
    setLoadingChapters(true);
    aiAPI.getChapters(classLevel, board || 'CBSE', subject)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setChapters(Array.isArray(data) ? data : []);
      })
      .catch(() => { setChapters([]); toast.error('Could not load chapters'); })
      .finally(() => setLoadingChapters(false));
    setChapter(''); setTopicFromCurriculum(''); setTopics([]);
  }, [classLevel, board, subject]);

  // ── Load topics when chapter changes ──
  useEffect(() => {
    if (!classLevel || !subject || !chapter) { setTopics([]); setTopicFromCurriculum(''); return; }
    setLoadingTopics(true);
    aiAPI.getTopics(classLevel, board || 'CBSE', subject, chapter)
      .then(res => {
        const data = res.data?.data || res.data || [];
        setTopics(Array.isArray(data) ? data : []);
      })
      .catch(() => { setTopics([]); toast.error('Could not load topics'); })
      .finally(() => setLoadingTopics(false));
    setTopicFromCurriculum('');
  }, [classLevel, board, subject, chapter]);

  // ── Resolve the final topic ──
  const getFinalTopic = useCallback(() => {
    return customTopic.trim() || topicFromCurriculum || chapter || subject || '';
  }, [customTopic, topicFromCurriculum, chapter, subject]);

  // ── Generate Mind Map ──
  const generateMap = async (overrideTopic) => {
    const t = (typeof overrideTopic === 'string' ? overrideTopic : getFinalTopic()).trim();
    if (!t) { toast.error('Select a topic or type one'); return; }
    setCustomTopic(t); setCurrentTopic(t);
    setLoading(true); setMindmap(null); setFlowchart(null);
    setSelectedNode(null); setNotesOpen(false); setCached(false);
    try {
      if (viewMode === 'flowchart') {
        const res = await aiAPI.generateFlowchart(t, {
          class_level: classLevel || undefined, board: board || undefined,
          subject: subject || undefined, goal: goal || undefined,
        });
        setFlowchart(res.data?.data || res.data);
      } else {
        const res = await aiAPI.generateMindMap(t, 3, {
          class_level: classLevel || undefined, board: board || undefined,
          subject: subject || undefined, chapter: chapter || undefined, goal: goal || undefined,
        });
        const data = res.data?.data || res.data;
        setMindmap(data.tree || data);
        setCached(!!data.cached);
      }
      setHistory(prev => {
        const filtered = prev.filter(h => h.topic !== t);
        return [{ topic: t, classLevel, board, subject, chapter, goal, timestamp: Date.now() }, ...filtered].slice(0, 8);
      });
    } catch (e) {
      console.error('[MindMap]', e);
      toast.error('Generation failed — please try again');
    } finally { setLoading(false); }
  };

  // ── Switch view mode and regenerate ──
  const switchView = (mode) => {
    setViewMode(mode);
    if (currentTopic) {
      setMindmap(null); setFlowchart(null);
      // Will regenerate on next Generate click — don't auto-regenerate to save API calls
    }
  };

  const handleNodeClick = (node) => { setSelectedNode(node); setNotesOpen(true); };
  const handleCloseNotes = () => setNotesOpen(false);

  const svgW = 1200, svgH = 850;
  const hasResult = viewMode === 'mindmap' ? !!mindmap : !!flowchart;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-52 h-52 bg-fuchsia-500/10 rounded-full translate-y-1/2" />
        <div className="absolute top-6 right-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Brain size={24} className="text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Mind Map & Flowchart</h1>
            <p className="text-purple-300/70 text-sm mt-0.5">Curriculum-aware maps, flowcharts, study notes &amp; doubt clearing — all AI-powered</p>
          </div>
        </div>
      </div>

      {/* ═══ CURRICULUM DRILL-DOWN ═══ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 space-y-4">
        {/* Row 1: Class → Board → Subject → Chapter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select value={classLevel} onChange={setClassLevel} options={CLASS_OPTIONS} icon={GraduationCap} label="Class" />
          <Select value={board} onChange={setBoard} options={BOARD_OPTIONS} icon={Layers} label="Board" />
          <Select value={subject} onChange={setSubject} icon={BookMarked} label="Subject" loading={loadingSubjects}
            disabled={!classLevel}
            options={[{ value: '', label: subjects.length ? 'Select Subject' : classLevel ? 'Loading...' : 'Pick class first' }, ...subjects.map(s => ({ value: s, label: s }))]} />
          <Select value={chapter} onChange={setChapter} icon={BookOpen} label="Chapter" loading={loadingChapters}
            disabled={!subject}
            options={[{ value: '', label: chapters.length ? 'Select Chapter' : subject ? 'Loading...' : 'Pick subject first' }, ...chapters.map(c => ({ value: c.name, label: `${c.number}. ${c.name}` }))]} />
        </div>

        {/* Row 2: Topic (from curriculum) → Goal → View Mode */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select value={topicFromCurriculum} onChange={setTopicFromCurriculum} icon={FlaskConical} label="Topic (optional)" loading={loadingTopics}
            disabled={!chapter}
            options={[{ value: '', label: topics.length ? 'Select Topic' : chapter ? 'Loading...' : 'Pick chapter first' }, ...topics.map(t => ({ value: t.name, label: `${t.name}${t.exam_weight === 'high' ? ' 🔥' : ''}` }))]} />

          {/* Goal pills */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Goal</label>
            <div className="flex gap-1.5">
              {GOAL_OPTIONS.map(g => (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    goal === g.value
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200/40'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}>
                  <g.icon size={13} /> <span className="hidden sm:inline">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">View</label>
            <div className="flex gap-1.5">
              <button onClick={() => switchView('mindmap')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'mindmap' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}><Brain size={13} /> Map</button>
              <button onClick={() => switchView('flowchart')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'flowchart' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}><GitBranch size={13} /> Flow</button>
            </div>
          </div>
        </div>

        {/* Custom topic + Generate */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Brain size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={customTopic} onChange={e => setCustomTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateMap()}
              placeholder={topicFromCurriculum || chapter ? `Using: ${topicFromCurriculum || chapter} (or type custom)` : 'Type any topic, or select from curriculum above...'}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all" />
          </div>
          <button onClick={() => generateMap()} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200/40 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>

        {/* Quick topics */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOPICS.map(s => (
            <button key={s.label} onClick={() => generateMap(s.label)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95">
              <span>{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            {viewMode === 'flowchart' ? <GitBranch size={28} className="text-white" /> : <Brain size={28} className="text-white" />}
          </div>
          <p className="font-bold text-gray-700">Creating your {viewMode === 'flowchart' ? 'flowchart' : 'mind map'}...</p>
          <p className="text-sm text-gray-400 mt-1">
            AI is organizing <span className="font-semibold text-indigo-500">&ldquo;{currentTopic}&rdquo;</span>{' '}
            {classLevel && `for Class ${classLevel} `}{board && `(${board}) `}{subject && `${subject} `}
          </p>
          <Spinner className="mt-4" />
        </div>
      )}

      {/* ═══ MIND MAP CANVAS ═══ */}
      {mindmap && viewMode === 'mindmap' && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1.5 hover:bg-gray-100 rounded-md"><ZoomOut size={14} className="text-gray-500" /></button>
                <span className="text-[11px] text-gray-400 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-gray-100 rounded-md"><ZoomIn size={14} className="text-gray-500" /></button>
              </div>
              {cached && <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full"><Clock size={11} /> Cached</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 hidden sm:inline">Click any node for study notes</span>
              <button onClick={() => generateMap(currentTopic)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
          </div>
          <div className="overflow-auto bg-gradient-to-br from-slate-50 to-gray-50" style={{ maxHeight: '620px' }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW * zoom} height={svgH * zoom}
              className="mx-auto" style={{ minWidth: svgW * zoom }}>
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#00000015" />
                </filter>
                <style>{`
                  @keyframes fadeScale { from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)} }
                  .animate-draw{stroke-dasharray:600;stroke-dashoffset:600;animation:drawLine 0.8s ease-out forwards}
                  @keyframes drawLine{to{stroke-dashoffset:0}}
                `}</style>
              </defs>
              <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.6" fill="#D1D5DB" fillOpacity="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />
              <MindMapNode node={mindmap} x={svgW / 2} y={svgH / 2} angle={0} radius={230}
                depth={0} onNodeClick={handleNodeClick} selectedId={selectedNode?.title} />
            </svg>
          </div>
        </div>
      )}

      {/* ═══ FLOWCHART CANVAS ═══ */}
      {flowchart && viewMode === 'flowchart' && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <GitBranch size={15} className="text-indigo-500" />
              <span className="text-sm font-bold text-gray-700">{flowchart.title || currentTopic}</span>
              {flowchart.description && <span className="text-xs text-gray-400 hidden sm:inline">— {flowchart.description}</span>}
            </div>
            <button onClick={() => generateMap(currentTopic)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
          <div className="overflow-auto bg-gradient-to-br from-slate-50 to-gray-50 p-4" style={{ maxHeight: '620px' }}>
            <FlowchartRenderer data={flowchart} onNodeClick={handleNodeClick} />
          </div>
          {flowchart.key_insight && (
            <div className="px-4 py-3 border-t border-gray-100 bg-amber-50/40">
              <p className="text-xs flex items-center gap-1.5"><Lightbulb size={13} className="text-amber-500" />
                <span className="font-bold text-amber-700">Key Insight:</span>
                <span className="text-gray-600">{flowchart.key_insight}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!hasResult && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
            <Brain size={36} className="text-indigo-500" />
          </div>
          <h2 className="font-bold text-lg text-gray-700 mb-2">Create Your {viewMode === 'flowchart' ? 'Flowchart' : 'Mind Map'}</h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Select your class, board &amp; subject above to browse chapters and topics from the real curriculum —
            or type any topic. Click any node for AI study notes with PDF export!
          </p>
          {history.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-1.5"><Clock size={11} /> Recent</p>
              <div className="flex flex-wrap justify-center gap-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { if (h.classLevel) setClassLevel(h.classLevel); if (h.board) setBoard(h.board); generateMap(h.topic); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-all">
                    <Brain size={11} /> {h.topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DOUBT PANEL ═══ */}
      {!doubtOpen && hasResult && !loading && (
        <button onClick={() => setDoubtOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-sm font-semibold text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-all">
          <MessageCircle size={16} /> Have a doubt? Ask AI — get explanation with diagram
        </button>
      )}
      {doubtOpen && (
        <DoubtPanel classLevel={classLevel} board={board} subject={subject} chapter={chapter}
          onClose={() => setDoubtOpen(false)} />
      )}

      {/* ═══ NOTES PANEL ═══ */}
      {notesOpen && selectedNode && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in" onClick={handleCloseNotes} />
          <NotesPanel node={selectedNode} topic={currentTopic} classLevel={classLevel} board={board} subject={subject}
            onClose={handleCloseNotes} onExpand={(t) => generateMap(t)} />
        </>
      )}
    </div>
  );
}
