'use client';

// ─── Diagram Type Definitions (for AI-generated diagrams) ─────────────────────
// type Point = { x: number; y: number }; // 0–100 coordinate space
// type DrawStep =
//   | { type: 'line';   from: Point; to: Point; color?: string; width?: number }
//   | { type: 'rect';   topLeft: Point; width: number; height: number; fill?: string; stroke?: string; strokeWidth?: number }
//   | { type: 'circle'; center: Point; radius: number; fill?: string; stroke?: string; strokeWidth?: number }
//   | { type: 'arrow';  from: Point; to: Point; color?: string; width?: number }
//   | { type: 'text';   at: Point; text: string; size?: number; color?: string; align?: 'left'|'center'|'right' }
//   | { type: 'pause';  ms: number };
// type DiagramPayload = { title: string; description: string; steps: DrawStep[] };

// Helper: SVG pie segment path
function pieSegment(cx, cy, r, startDeg, endDeg) {
  const rad = (d) => (d * Math.PI) / 180;
  const x1 = +(cx + r * Math.cos(rad(startDeg))).toFixed(2);
  const y1 = +(cy + r * Math.sin(rad(startDeg))).toFixed(2);
  const x2 = +(cx + r * Math.cos(rad(endDeg))).toFixed(2);
  const y2 = +(cy + r * Math.sin(rad(endDeg))).toFixed(2);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

// TODO: Replace with AI-generated DiagramPayload from Gemini:
// const diagram = await gemini.generateDiagram({ topic, subtopic, learnerLevel });
const HARDCODED_DIAGRAM = {
  title: 'Fractions: Why 1/4 = 2/8',
  description: 'Both blue pieces cover the same area — just cut into more slices!',
};

export default function BlackboardDiagram({ diagram }) {
  // TODO: When `diagram` prop is provided (Gemini output), render its DrawSteps
  // For now, render the hardcoded fractions example
  const payload = diagram || HARDCODED_DIAGRAM;

  // 1/4 circle — 4 equal segments, first one filled
  const quarterSegs = Array.from({ length: 4 }, (_, i) => ({
    d: pieSegment(60, 60, 44, i * 90, (i + 1) * 90),
    fill: i === 0 ? '#3b82f6' : '#1e3a5f',
  }));

  // 2/8 circle — 8 equal segments, first two filled
  const eighthSegs = Array.from({ length: 8 }, (_, i) => ({
    d: pieSegment(60, 60, 44, i * 45, (i + 1) * 45),
    fill: i < 2 ? '#3b82f6' : '#1e3a5f',
  }));

  // Spoke lines for each circle
  const spokes = (n) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (i * (360 / n) * Math.PI) / 180;
      return {
        x2: +(60 + 44 * Math.cos(angle)).toFixed(2),
        y2: +(60 + 44 * Math.sin(angle)).toFixed(2),
      };
    });

  return (
    <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e3a5f]">
      <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Visual Diagram</p>
      <h4 className="text-white text-[14px] font-semibold mb-1">{payload.title}</h4>
      <p className="text-blue-300/60 text-[12px] mb-5 leading-snug">{payload.description}</p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* ── 1/4 Circle ── */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {quarterSegs.map((s, i) => (
              <path key={i} d={s.d} fill={s.fill} stroke="#0f172a" strokeWidth="2" />
            ))}
            {spokes(4).map((sp, i) => (
              <line key={i} x1="60" y1="60" x2={sp.x2} y2={sp.y2} stroke="#0f172a" strokeWidth="1.5" />
            ))}
            <circle cx="60" cy="60" r="44" fill="none" stroke="#334155" strokeWidth="1" />
          </svg>
          <div className="text-center">
            <span className="text-blue-400 text-[20px] font-black">1</span>
            <div className="w-8 h-[2px] bg-blue-400 mx-auto my-1" />
            <span className="text-white text-[20px] font-black">4</span>
          </div>
          <p className="text-blue-300/50 text-[10px]">1 of 4 equal parts</p>
        </div>

        {/* ── Equals ── */}
        <span className="text-white/60 text-[32px] font-black">=</span>

        {/* ── 2/8 Circle ── */}
        <div className="flex flex-col items-center gap-3">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {eighthSegs.map((s, i) => (
              <path key={i} d={s.d} fill={s.fill} stroke="#0f172a" strokeWidth="2" />
            ))}
            {spokes(8).map((sp, i) => (
              <line key={i} x1="60" y1="60" x2={sp.x2} y2={sp.y2} stroke="#0f172a" strokeWidth="1.5" />
            ))}
            <circle cx="60" cy="60" r="44" fill="none" stroke="#334155" strokeWidth="1" />
          </svg>
          <div className="text-center">
            <span className="text-blue-400 text-[20px] font-black">2</span>
            <div className="w-8 h-[2px] bg-blue-400 mx-auto my-1" />
            <span className="text-white text-[20px] font-black">8</span>
          </div>
          <p className="text-blue-300/50 text-[10px]">2 of 8 equal parts</p>
        </div>
      </div>

      <p className="text-center text-emerald-400 text-[12px] font-medium mt-5">
        ✓ Same blue area — just cut into more pieces. That&apos;s equivalent fractions!
      </p>

      {/* TODO: Animate drawing step-by-step using DrawStep[] when AI provides the diagram */}
    </div>
  );
}
