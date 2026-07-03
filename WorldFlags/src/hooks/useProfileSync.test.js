import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildProfilePayload } from './useProfileSync.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('buildProfilePayload', () => {
  it('omits server-owned streak and leaderboard fields from direct profile writes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-03T12:00:00Z'));

    const payload = buildProfilePayload(
      { id: 'user-1', email: 'player@example.com' },
      { fr: { totalAnswers: 1, correctAnswers: 1 } }
    );

    expect(payload).toEqual({
      id: 'user-1',
      display_name: 'player@example.com',
      progress: { fr: { totalAnswers: 1, correctAnswers: 1 } },
      updated_at: '2026-07-03T12:00:00.000Z',
    });
    expect(payload).not.toHaveProperty('streak');
    expect(payload).not.toHaveProperty('weekly_xp');
    expect(payload).not.toHaveProperty('week_start');

  });
});
