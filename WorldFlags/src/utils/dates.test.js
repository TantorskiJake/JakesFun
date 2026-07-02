import { describe, it, expect, afterEach, vi } from 'vitest';
import { localDateStr, yesterdayStr } from './dates.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('localDateStr', () => {
  it('formats an explicit date as YYYY-MM-DD', () => {
    expect(localDateStr(new Date(2026, 6, 2))).toBe('2026-07-02');
  });

  it('pads single-digit month and day with zeros', () => {
    expect(localDateStr(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localDateStr(new Date(2026, 8, 9))).toBe('2026-09-09');
  });

  it('defaults to the current (system) time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0));
    expect(localDateStr()).toBe('2026-03-15');
  });

  it('uses the local calendar date, not UTC (late evening west of UTC)', () => {
    // 2026-01-06T02:00Z is still Jan 5 in New York. toISOString() would
    // say '2026-01-06'; localDateStr must say '2026-01-05'.
    const prevTZ = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const d = new Date('2026-01-06T02:00:00Z');
      expect(localDateStr(d)).toBe('2026-01-05');
      expect(d.toISOString().slice(0, 10)).toBe('2026-01-06');
    } finally {
      if (prevTZ === undefined) delete process.env.TZ;
      else process.env.TZ = prevTZ;
    }
  });
});

describe('yesterdayStr', () => {
  it('returns the previous calendar day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 2, 10, 0, 0));
    expect(yesterdayStr()).toBe('2026-07-01');
  });

  it('crosses month boundaries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 1, 8, 0, 0)); // March 1
    expect(yesterdayStr()).toBe('2026-02-28');
  });

  it('crosses year boundaries', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 8, 0, 0)); // Jan 1
    expect(yesterdayStr()).toBe('2025-12-31');
  });

  it('handles leap years', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 1, 8, 0, 0)); // March 1, 2024
    expect(yesterdayStr()).toBe('2024-02-29');
  });
});
