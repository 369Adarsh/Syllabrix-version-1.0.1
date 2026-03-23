'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/**
 * MapView — Renders interactive maps using Leaflet.js (free, open source)
 * Usage: <MapView markers={[{ lat: 28.6, lng: 77.2, label: 'Delhi', desc: 'Capital of India' }]} />
 * Or: <MapView center={[20.5, 78.9]} zoom={5} /> for just a map of India
 */
export default function MapView({ markers = [], center, zoom = 5, height = 300, className = '' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      // Dynamically import Leaflet
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;

      const defaultCenter = center || [20.5937, 78.9629]; // India center
      const map = window.L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(defaultCenter, zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Add markers
      markers.forEach(m => {
        if (!m.lat || !m.lng) return;
        const marker = window.L.marker([m.lat, m.lng]).addTo(map);
        if (m.label || m.desc) {
          marker.bindPopup(`<strong>${m.label || ''}</strong>${m.desc ? '<br/>' + m.desc : ''}`);
        }
      });

      // Fit bounds if multiple markers
      if (markers.length > 1) {
        const bounds = markers.filter(m => m.lat && m.lng).map(m => [m.lat, m.lng]);
        if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
      }

      mapInstanceRef.current = map;
      setLoaded(true);

      // Fix Leaflet rendering issue
      setTimeout(() => map.invalidateSize(), 100);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 ${className}`}>
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <MapPin size={12} className="text-blue-500" />
        <span className="text-[11px] font-bold text-gray-600">
          {markers.length > 0 ? `${markers.length} location${markers.length > 1 ? 's' : ''}` : 'Map View'}
        </span>
      </div>
      <div ref={mapRef} style={{ height: `${height}px`, width: '100%', background: '#f0f0f0' }}>
        {!loaded && (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Loading map...
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper: Extract map-worthy locations from AI text
 */
export function extractLocations(text) {
  // Common Indian cities/landmarks with coords
  const KNOWN = {
    'delhi': { lat: 28.6139, lng: 77.209 },
    'mumbai': { lat: 19.076, lng: 72.8777 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.385, lng: 78.4867 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'shimla': { lat: 31.1048, lng: 77.1734 },
    'goa': { lat: 15.2993, lng: 74.124 },
    'kashmir': { lat: 34.0837, lng: 74.7973 },
    'taj mahal': { lat: 27.1751, lng: 78.0421 },
    'red fort': { lat: 28.6562, lng: 77.241 },
    'gateway of india': { lat: 18.9220, lng: 72.8347 },
    'india gate': { lat: 28.6129, lng: 77.2295 },
  };

  const found = [];
  const lower = text.toLowerCase();
  Object.entries(KNOWN).forEach(([name, coords]) => {
    if (lower.includes(name)) {
      found.push({ ...coords, label: name.charAt(0).toUpperCase() + name.slice(1) });
    }
  });
  return found;
}
