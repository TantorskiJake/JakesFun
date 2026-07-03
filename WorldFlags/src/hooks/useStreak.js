import { useState, useCallback, useRef } from 'react';
import { localDateStr } from '../utils/dates.js';
import { xpForSession } from '../utils/sessionScoring.js';

export const STREAK_KEY = 'world-flags-streak-v1';

// Streak freezes: earned every 7 consecutive practice days, stored up to 2,
// and spent automatically when exactly one day was missed.
const FREEZE_EVERY_DAYS = 7;
const MAX_FREEZES = 2;

function todayStr() {
  return localDateStr(); // "YYYY-MM-DD"
}

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateStr(d);
}

// Monday of the current week, used as the weekly-XP bucket key.
export function weekStartStr() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return localDateStr(d);
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
    freezes: 0,
    freezesEarned: 0,
    weeklyXP: 0,
    weekStart: null,
  };
}

function save(streakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
}

export function useStreak() {
  const [streakData, setStreakData] = useState(load);
  // Mirror of the latest state so recordSession can compute and return the
  // next state synchronously (React may defer functional updaters).
  const dataRef = useRef(streakData);

  const recordSession = useCallback((correct, total) => {
    const prev = dataRef.current;
    const today = todayStr();
    const yesterday = daysAgoStr(1);
    const dayBeforeYesterday = daysAgoStr(2);

    let newStreak;
    let freezes = prev.freezes || 0;
    let freezesEarned = prev.freezesEarned || 0;
    let freezeConsumed = false;

    if (prev.lastPracticeDate === today) {
      // Already practiced today — streak unchanged
      newStreak = prev.currentStreak;
    } else if (prev.lastPracticeDate === yesterday) {
      // Consecutive day — increment
      newStreak = prev.currentStreak + 1;
    } else if (prev.lastPracticeDate === dayBeforeYesterday && freezes > 0) {
      // Exactly one missed day and a freeze in the bank — spend it to
      // bridge the gap and keep the streak going (+1 for today).
      freezes -= 1;
      freezeConsumed = true;
      newStreak = prev.currentStreak + 1;
    } else {
      // Gap or first session ever — reset to 1
      newStreak = 1;
    }

    // Earn a freeze each time the streak advances to a multiple of 7 days.
    if (prev.lastPracticeDate !== today && newStreak > 0 && newStreak % FREEZE_EVERY_DAYS === 0) {
      freezesEarned += 1;
      freezes = Math.min(freezes + 1, MAX_FREEZES);
    }

    const xpEarned = xpForSession(correct, total);
    const newTotalXP = prev.totalXP + xpEarned;
    const newLevel = Math.floor(newTotalXP / 200) + 1;
    const newLongest = Math.max(prev.longestStreak, newStreak);

    // Weekly XP resets whenever the stored bucket isn't this week's Monday.
    const weekStart = weekStartStr();
    const weeklyXP = (prev.weekStart === weekStart ? prev.weeklyXP || 0 : 0) + xpEarned;

    const next = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
      totalXP: newTotalXP,
      level: newLevel,
      freezes,
      freezesEarned,
      weeklyXP,
      weekStart,
    };

    save(next);
    dataRef.current = next;
    setStreakData(next);
    return { ...next, freezeConsumed };
  }, []);

  const replaceStreak = useCallback((next) => {
    const safeNext = { ...defaultState(), ...(next || {}) };
    save(safeNext);
    dataRef.current = safeNext;
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
