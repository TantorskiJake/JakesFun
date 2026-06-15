import { useState, useCallback } from 'react';
import { getInitialCard, updateCard } from '../utils/sm2';

export const PROGRESS_KEY = 'world-flags-progress-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

function save(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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
      save(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setProgress({});
  }, []);

  const replaceProgress = useCallback((next) => {
    const safeNext = next && typeof next === 'object' ? next : {};
    save(safeNext);
    setProgress(safeNext);
  }, []);

  return { progress, getCard, recordAnswer, resetProgress, replaceProgress };
}
