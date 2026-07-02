import { useState, useCallback } from 'react';
import { localDateStr, yesterdayStr } from '../utils/dates.js';

export const STREAK_KEY = 'world-flags-streak-v1';

function todayStr() {
  return localDateStr(); // "YYYY-MM-DD"
}

function load() {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (!stored) return defaultState();
    return { ...defaultState(), ...JSON.parse(stored) };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    totalXP: 0,
    level: 1,
  };
}

function save(streakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
}

export function useStreak() {
  const [streakData, setStreakData] = useState(load);

  const recordSession = useCallback((correct, total) => {
    // Every mutation saves to localStorage, so load() reflects the current
    // state; computing here (not in the updater) lets us return the result.
    const prev = load();
    const today = todayStr();
    const yesterday = yesterdayStr();

    let newStreak = prev.currentStreak;

    if (prev.lastPracticeDate === today) {
      // Already practiced today — streak unchanged
      newStreak = prev.currentStreak;
    } else if (prev.lastPracticeDate === yesterday) {
      // Consecutive day — increment
      newStreak = prev.currentStreak + 1;
    } else {
      // Gap or first session ever — reset to 1
      newStreak = 1;
    }

    const xpEarned = correct * 10 + (correct === total ? 50 : 0);
    const newTotalXP = prev.totalXP + xpEarned;
    const newLevel = Math.floor(newTotalXP / 200) + 1;
    const newLongest = Math.max(prev.longestStreak, newStreak);

    const next = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
      totalXP: newTotalXP,
      level: newLevel,
    };

    save(next);
    setStreakData(next);
    return next;
  }, []);

  const replaceStreak = useCallback((next) => {
    const safeNext = { ...defaultState(), ...(next || {}) };
    save(safeNext);
    setStreakData(safeNext);
  }, []);

  const { currentStreak, longestStreak, totalXP, level } = streakData;
  return {
    ...streakData,
    currentStreak,
    longestStreak,
    totalXP,
    level,
    recordSession,
    replaceStreak,
  };
}
