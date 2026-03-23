'use client';
import { useState } from 'react';

/**
 * DiagramRenderer — Takes diagram data from AI and renders as SVG
 * Input: { type: 'solar_system|brain|circuit|flowchart|cycle|hierarchy', nodes: [...], connections: [...] }
 *
 * Usage: <DiagramRenderer data={diagramData} />
 */

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#EC4899', '#0891B2', '#65A30D', '#6366F1'];

export default function DiagramRenderer({ data, className = '' }) {
  const [hovered, setHovered] = useState(null);

  if (!data) return null;

  // If data is a string description, render as labeled diagram
  if (typeof data === 'string') {
    return (
      <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50 ${className}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">📊 Diagram</p>
        <p className="text-sm text-gray-700">{data}</p>
      </div>
    );
  }

  const nodes = data.nodes || data.elements || data.items || [];
  const connections = data.connections || data.links || data.edges || [];
  const title = data.title || data.type || 'Diagram';
  const type = data.type || 'flowchart';

  if (nodes.length === 0) return null;

  // Layout calculations
  const W = 600, H = 400;
  const cx = W / 2, cy = H / 2;

  // Position nodes based on type
  const positioned = nodes.map((node, i) => {
    const n = typeof node === 'string' ? { label: node } : node;
    const count = nodes.length;
    let x, y;

    if (type === 'cycle' || type === 'solar_system' || type === 'circular') {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const radius = Math.min(W, H) * 0.35;
      x = cx + radius * Math.cos(angle);
      y = cy + radius * Math.sin(angle);
    } else if (type === 'hierarchy' || type === 'tree') {
      const levels = Math.ceil(Math.sqrt(count));
      const level = Math.floor(i / levels);
      const pos = i % levels;
      const itemsInLevel = Math.min(levels, count - level * levels);
      x = ((pos + 1) / (itemsInLevel + 1)) * W;
      y = ((level + 1) / (Math.ceil(count / levels) + 1)) * H;
    } else {
      // Flowchart — top to bottom
      const cols = Math.min(3, count);
      const row = Math.floor(i / cols);
      const col = i % cols;
      const itemsInRow = Math.min(cols, count - row * cols);
      x = ((col + 1) / (itemsInRow + 1)) * W;
      y = 60 + row * 90;
    }

    return { ...n, x, y, color: COLORS[i % COLORS.length], id: i };
  });

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xs">📊</span>
        <span className="text-[11px] font-bold text-gray-600">{title}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '350px' }}>
        {/* Background */}
        <rect width={W} height={H} fill="#FAFAFA" />

        {/* Center for radial types */}
        {(type === 'solar_system' || type === 'cycle' || type === 'circular') && (
          <circle cx={cx} cy={cy} r={20} fill="#4F46E5" opacity={0.1} />
        )}

        {/* Connections */}
        {positioned.map((node, i) => {
          if (i === 0 && type !== 'cycle') return null;
          const prev = type === 'cycle'
            ? positioned[(i - 1 + positioned.length) % positioned.length]
            : (type === 'solar_system' ? { x: cx, y: cy } : positioned[i - 1]);
          if (!prev) return null;
          return (
            <line key={`c-${i}`} x1={prev.x} y1={prev.y} x2={node.x} y2={node.y}
              stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray={type === 'cycle' ? '0' : '4,4'} />
          );
        })}

        {/* Nodes */}
        {positioned.map((node, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <rect x={node.x - 55} y={node.y - 18} width={110} height={36} rx={10}
              fill={hovered === i ? node.color : 'white'} stroke={node.color} strokeWidth={2}
              style={{ transition: 'fill 0.2s' }} />
            <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={11}
              fontWeight={600} fill={hovered === i ? 'white' : node.color}
              style={{ transition: 'fill 0.2s' }}>
              {(node.label || node.name || `Node ${i + 1}`).slice(0, 16)}
            </text>
          </g>
        ))}

        {/* Arrows for flowchart */}
        {type === 'flowchart' && positioned.length > 1 && positioned.map((node, i) => {
          if (i === 0) return null;
          const prev = positioned[i - 1];
          const midX = (prev.x + node.x) / 2;
          const midY = (prev.y + node.y) / 2;
          return (
            <polygon key={`a-${i}`}
              points={`${midX},${midY - 4} ${midX + 5},${midY + 2} ${midX - 5},${midY + 2}`}
              fill="#94A3B8" />
          );
        })}
      </svg>

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
          {positioned.slice(0, 8).map((n, i) => (
            <span key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
              {(n.label || n.name || `Node ${i + 1}`).slice(0, 20)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper: Parse AI text for diagram-worthy content
 */
export function extractDiagramFromText(text) {
  if (!text) return null;
  // Look for ordered lists that could be a process/cycle
  const steps = text.match(/(?:step\s*\d+|^\d+[.)]\s*)/gim);
  if (steps && steps.length >= 3) {
    const lines = text.split('\n').filter(l => /^\d+[.)]\s*/.test(l.trim()));
    if (lines.length >= 3) {
      return {
        type: 'flowchart',
        title: 'Process Flow',
        nodes: lines.map(l => ({ label: l.replace(/^\d+[.)]\s*/, '').trim().slice(0, 30) })),
      };
    }
  }
  return null;
}
