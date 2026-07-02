import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getInitialCard, updateCard, isDue, masteryLevel } from './sm2.js';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0)); // 2026-03-15 local
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getInitialCard', () => {
  it('returns a fresh card due today', () => {
    expect(getInitialCard()).toEqual({
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
      dueDate: '2026-03-15',
      totalAnswers: 0,
      correctAnswers: 0,
    });
  });
});

describe('updateCard — correct answers', () => {
  it('progresses interval 1 -> 6 -> round(interval * easeFactor)', () => {
    const c1 = updateCard(getInitialCard(), true);
    expect(c1.repetitions).toBe(1);
    expect(c1.interval).toBe(1);
    expect(c1.dueDate).toBe('2026-03-16');

    const c2 = updateCard(c1, true);
    expect(c2.repetitions).toBe(2);
    expect(c2.interval).toBe(6);
    expect(c2.dueDate).toBe('2026-03-21');

    const c3 = updateCard(c2, true);
    expect(c3.repetitions).toBe(3);
    expect(c3.interval).toBe(Math.round(6 * c2.easeFactor)); // 15
    expect(c3.dueDate).toBe('2026-03-30');
  });

  it('leaves easeFactor unchanged for quality-4 answers', () => {
    // delta = 0.1 - (5-4) * (0.08 + (5-4) * 0.02) = 0
    const c1 = updateCard(getInitialCard(), true);
    expect(c1.easeFactor).toBeCloseTo(2.5, 10);
  });

  it('increments answer counters', () => {
    const c1 = updateCard(getInitialCard(), true);
    expect(c1.totalAnswers).toBe(1);
    expect(c1.correctAnswers).toBe(1);
  });
});

describe('updateCard — wrong answers', () => {
  it('resets repetitions and sets interval to 1', () => {
    let card = getInitialCard();
    card = updateCard(card, true);
    card = updateCard(card, true);
    expect(card.repetitions).toBe(2);

    const wrong = updateCard(card, false);
    expect(wrong.repetitions).toBe(0);
    expect(wrong.interval).toBe(1);
    expect(wrong.dueDate).toBe('2026-03-16');
    expect(wrong.totalAnswers).toBe(3);
    expect(wrong.correctAnswers).toBe(2);
  });

  it('lowers easeFactor by 0.54 per failure and floors at 1.3', () => {
    let card = getInitialCard();
    card = updateCard(card, false);
    expect(card.easeFactor).toBeCloseTo(1.96, 10);
    card = updateCard(card, false);
    expect(card.easeFactor).toBeCloseTo(1.42, 10);
    card = updateCard(card, false);
    expect(card.easeFactor).toBe(1.3);
    card = updateCard(card, false);
    expect(card.easeFactor).toBe(1.3);
  });
});

describe('isDue', () => {
  it('treats a missing card as due', () => {
    expect(isDue(undefined)).toBe(true);
    expect(isDue(null)).toBe(true);
  });

  it('treats a card without a dueDate as due', () => {
    expect(isDue({ repetitions: 1 })).toBe(true);
  });

  it('is due when dueDate is today or in the past', () => {
    expect(isDue({ dueDate: '2026-03-15' })).toBe(true);
    expect(isDue({ dueDate: '2026-03-01' })).toBe(true);
    expect(isDue({ dueDate: '2020-12-31' })).toBe(true);
  });

  it('is not due when dueDate is in the future', () => {
    expect(isDue({ dueDate: '2026-03-16' })).toBe(false);
    expect(isDue({ dueDate: '2027-01-01' })).toBe(false);
  });
});

describe('masteryLevel', () => {
  it('is 0 for missing or never-answered cards', () => {
    expect(masteryLevel(undefined)).toBe(0);
    expect(masteryLevel(null)).toBe(0);
    expect(masteryLevel({ repetitions: 0 })).toBe(0);
  });

  it('is 1 for 1-2 repetitions', () => {
    expect(masteryLevel({ repetitions: 1 })).toBe(1);
    expect(masteryLevel({ repetitions: 2 })).toBe(1);
  });

  it('is 2 for 3-5 repetitions', () => {
    expect(masteryLevel({ repetitions: 3 })).toBe(2);
    expect(masteryLevel({ repetitions: 5 })).toBe(2);
  });

  it('is 3 for 6+ repetitions', () => {
    expect(masteryLevel({ repetitions: 6 })).toBe(3);
    expect(masteryLevel({ repetitions: 12 })).toBe(3);
  });
});
