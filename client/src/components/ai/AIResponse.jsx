'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SpeakButton from './SpeakButton';
import MathRenderer, { hasMath } from './MathRenderer';
import DiagramRenderer, { extractDiagramFromText } from './DiagramRenderer';

// Lazy load MapView (Leaflet is heavy)
const MapView = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="h-32 bg-gray-100 rounded-xl animate-pulse" /> });

/**
 * AIResponse — Drop-in replacement for displaying AI-generated text.
 * Auto-detects and renders: math equations (KaTeX), diagrams (SVG), maps (Leaflet), TTS button.
 *
 * Usage: <AIResponse text={aiReply} showTTS showDiagram showMap />
 * Or simply: <AIResponse text={aiReply} /> for auto-detection
 */
export default function AIResponse({
  text,
  diagram,         // explicit diagram data { type, nodes, connections }
  mapMarkers,      // explicit markers [{ lat, lng, label }]
  showTTS = true,
  className = '',
}) {
  if (!text) return null;

  const containsMath = hasMath(text);
  const autoDiagram = diagram || extractDiagramFromText(text);

  // Auto-detect map locations
  let autoMarkers = mapMarkers;
  if (!autoMarkers) {
    const { extractLocations } = require('./MapView');
    const found = extractLocations(text);
    if (found.length >= 2) autoMarkers = found;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* TTS Button */}
      {showTTS && text.length > 50 && (
        <div className="flex justify-end">
          <SpeakButton text={text} size="xs" />
        </div>
      )}

      {/* Main text — with or without math rendering */}
      {containsMath ? (
        <MathRenderer text={text} className="text-[14px] text-gray-700" />
      ) : (
        <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</div>
      )}

      {/* Auto-detected diagram */}
      {autoDiagram && <DiagramRenderer data={autoDiagram} className="mt-3" />}

      {/* Auto-detected map */}
      {autoMarkers && autoMarkers.length > 0 && (
        <MapView markers={autoMarkers} height={250} className="mt-3" />
      )}
    </div>
  );
}
