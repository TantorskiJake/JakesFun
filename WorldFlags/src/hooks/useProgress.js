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

  // Review sessions update accuracy stats only — they must not advance the
  // SM-2 schedule, since re-reviewing within the same day isn't real recall.
  const recordReviewAnswer = useCallback((code, correct) => {
    setProgress((prev) => {
      const card = prev[code] || getInitialCard();
      const updated = {
        ...prev,
        [code]: {
          ...card,
          totalAnswers: card.totalAnswers + 1,
          correctAnswers: card.correctAnswers + (correct ? 1 : 0),
        },
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

  return { progress, getCard, recordAnswer, recordReviewAnswer, resetProgress, replaceProgress };
}
