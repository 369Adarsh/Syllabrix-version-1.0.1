'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext({
  prefs: { fontSize: 'normal', highContrast: false },
  setPrefs: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

const KEY = 'syllabrix_a11y';

const ZOOM = { normal: 1, large: 1.1, xl: 1.2 };

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefsState] = useState({ fontSize: 'normal', highContrast: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (saved.fontSize || saved.highContrast !== undefined) setPrefsState({ fontSize: 'normal', highContrast: false, ...saved });
    } catch {}
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-font-size', prefs.fontSize || 'normal');
    html.setAttribute('data-high-contrast', prefs.highContrast ? 'true' : 'false');
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }, [prefs]);

  const setPrefs = (update) =>
    setPrefsState(prev => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));

  return (
    <AccessibilityContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
