import { describe, it, expect } from 'vitest';
import { mergeProgress, mergeStreak } from './profileMerge.js';

function card(totalAnswers, extra = {}) {
  return { repetitions: 1, interval: 1, easeFactor: 2.5, totalAnswers, correctAnswers: 0, ...extra };
}

describe('mergeProgress', () => {
  it('returns {} for missing or empty inputs', () => {
    expect(mergeProgress()).toEqual({});
    expect(mergeProgress({}, {})).toEqual({});
    expect(mergeProgress(undefined, {})).toEqual({});
  });

  it('keeps cards that exist on only one side', () => {
    const local = { fr: card(3) };
    const cloud = { de: card(5) };
    const merged = mergeProgress(local, cloud);
    expect(merged.fr).toBe(local.fr);
    expect(merged.de).toBe(cloud.de);
    expect(Object.keys(merged).sort()).toEqual(['de', 'fr']);
  });

  it('picks the card with more totalAnswers, per code independently', () => {
    const local = { fr: card(10), de: card(1) };
    const cloud = { fr: card(2), de: card(7) };
    const merged = mergeProgress(local, cloud);
    expect(merged.fr).toBe(local.fr);
    expect(merged.de).toBe(cloud.de);
  });

  it('prefers the local card on ties', () => {
    const local = { fr: card(4, { correctAnswers: 4 }) };
    const cloud = { fr: card(4, { correctAnswers: 1 }) };
    expect(mergeProgress(local, cloud).fr).toBe(local.fr);
  });

  it('a card with zero answers still beats a missing card', () => {
    const cloud = { jp: card(0) };
    expect(mergeProgress({}, cloud).jp).toBe(cloud.jp);
    const local = { jp: card(0) };
    expect(mergeProgress(local, {}).jp).toBe(local.jp);
  });

  it('treats a card without totalAnswers as zero', () => {
    const local = { fr: { repetitions: 2 } }; // no totalAnswers field
    const cloud = { fr: card(1) };
    expect(mergeProgress(local, cloud).fr).toBe(cloud.fr);
  });
});

describe('mergeStreak', () => {
  it('returns empty-streak defaults for missing inputs', () => {
    expect(mergeStreak()).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      totalXP: 0,
      level: 1,
      freezes: 0,
      freezesEarned: 0,
      weeklyXP: 0,
      weekStart: null,
    });
    expect(mergeStreak(null, null).level).toBe(1);
  });

  it('takes the max of each numeric field independently', () => {
    const local = { currentStreak: 2, longestStreak: 10, totalXP: 500, level: 3 };
    const cloud = { currentStreak: 5, longestStreak: 4, totalXP: 200, level: 4 };
    const merged = mergeStreak(local, cloud);
    expect(merged.currentStreak).toBe(5);
    expect(merged.longestStreak).toBe(10);
    expect(merged.totalXP).toBe(500);
    expect(merged.level).toBe(4);
  });

  it('keeps the newer lastPracticeDate', () => {
    expect(
      mergeStreak({ lastPracticeDate: '2026-07-01' }, { lastPracticeDate: '2026-06-15' }).lastPracticeDate
    ).toBe('2026-07-01');
    expect(
      mergeStreak({ lastPracticeDate: '2026-06-15' }, { lastPracticeDate: '2026-07-01' }).lastPracticeDate
    ).toBe('2026-07-01');
  });

  it('handles a null lastPracticeDate on either side', () => {
    expect(
      mergeStreak({ lastPracticeDate: null }, { lastPracticeDate: '2026-07-01' }).lastPracticeDate
    ).toBe('2026-07-01');
    expect(
      mergeStreak({ lastPracticeDate: '2026-07-01' }, { lastPracticeDate: null }).lastPracticeDate
    ).toBe('2026-07-01');
    expect(
      mergeStreak({ lastPracticeDate: null }, { lastPracticeDate: null }).lastPracticeDate
    ).toBe(null);
  });
});
