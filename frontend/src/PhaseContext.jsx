import React, { createContext, useContext, useState } from 'react';

const PhaseContext = createContext(null);

/**
 * Tracks whether the app is in "vulnerable" or "mitigated" mode.
 * This controls which API endpoint the attacker console targets,
 * and which banners / labels are shown throughout the UI.
 */
export function PhaseProvider({ children }) {
  const [phase, setPhase] = useState('vulnerable'); // 'vulnerable' | 'mitigated'
  return (
    <PhaseContext.Provider value={{ phase, setPhase }}>
      {children}
    </PhaseContext.Provider>
  );
}

export const usePhase = () => useContext(PhaseContext);
