import { useState, useCallback } from 'react';
import { getInitialCard, updateCard } from '../utils/sm2';

const KEY = 'world-flags-progress-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  const getCard = useCallback(
    (code) => progress[code] || getInitialCard(),
    [progress]
  );

  const recordAnswer = useCallback((code, correct) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        [code]: updateCard(prev[code] || getInitialCard(), correct),
      };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(KEY);
    setProgress({});
  }, []);

  return { progress, getCard, recordAnswer, resetProgress };
}
