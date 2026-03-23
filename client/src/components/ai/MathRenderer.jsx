'use client';
import { useEffect, useRef } from 'react';

/**
 * MathRenderer — Renders text with inline math ($...$) and display math ($$...$$)
 * Uses KaTeX CDN (loaded in layout.jsx head)
 *
 * Usage: <MathRenderer text="The formula is $E = mc^2$ and display: $$\int_0^1 x^2 dx = \frac{1}{3}$$" />
 */
export default function MathRenderer({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Wait for KaTeX to be available
    const render = () => {
      if (typeof window === 'undefined' || !window.katex) {
        // Load KaTeX JS if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => renderMath();
        document.head.appendChild(script);
      } else {
        renderMath();
      }
    };

    const renderMath = () => {
      if (!window.katex || !containerRef.current) return;

      let html = text;

      // Replace display math $$...$$ first
      html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
        try {
          return `<div class="katex-display-block">${window.katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</div>`;
        } catch { return match; }
      });

      // Replace inline math $...$
      html = html.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
        try {
          return window.katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
        } catch { return match; }
      });

      // Replace \( ... \) inline
      html = html.replace(/\\\((.+?)\\\)/g, (match, latex) => {
        try {
          return window.katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
        } catch { return match; }
      });

      // Replace \[ ... \] display
      html = html.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
        try {
          return `<div class="katex-display-block">${window.katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false })}</div>`;
        } catch { return match; }
      });

      // Also detect common patterns like fractions, sqrt, etc. without $ delimiters
      // e.g., "x = (-b ± √(b²-4ac)) / 2a" — leave as-is but clean up
      html = html.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, a, b) => {
        try { return window.katex.renderToString(`\\frac{${a}}{${b}}`, { throwOnError: false }); } catch { return match; }
      });

      containerRef.current.innerHTML = html;
    };

    render();
  }, [text]);

  if (!text) return null;

  return (
    <div ref={containerRef} className={`math-renderer leading-relaxed ${className}`}
      style={{ lineHeight: '1.8' }}>
      {text}
      <style jsx global>{`
        .katex-display-block { margin: 12px 0; text-align: center; overflow-x: auto; }
        .katex-display-block .katex { font-size: 1.2em; }
        .katex { font-size: 1.05em; }
        .math-renderer .katex-html { white-space: nowrap; }
      `}</style>
    </div>
  );
}

/**
 * Helper: Detect if text contains math expressions
 */
export function hasMath(text) {
  if (!text) return false;
  return /\$[^$]+\$|\\\(|\\\[|\\frac|\\sqrt|\\sum|\\int|\\lim/.test(text);
}
