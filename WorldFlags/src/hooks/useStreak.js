import { useState, useCallback } from 'react';

const KEY = 'world-flags-streak-v1';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"streak":0,"lastDate":null}');
  } catch {
    return { streak: 0, lastDate: null };
  }
}

export function useStreak() {
  const [data, setData] = useState(load);

  const recordStudy = useCallback(() => {
    setData(prev => {
      const today = todayStr();
      if (prev.lastDate === today) return prev;
      const streak = prev.lastDate === yesterdayStr() ? prev.streak + 1 : 1;
      const next = { streak, lastDate: today };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { streak: data.streak, recordStudy };
}
