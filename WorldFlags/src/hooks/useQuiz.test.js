import { describe, it, expect } from 'vitest';
import { buildSession, buildReviewSession, getChoices, getCapitalChoices } from './useQuiz.js';
import { countries } from '../data/countries';
import { getConfusableGroup } from '../data/confusables';

const PAST = '2020-01-01';
const FUTURE = '2999-01-01';

function seenCard(dueDate) {
  return { repetitions: 1, interval: 1, easeFactor: 2.5, dueDate, totalAnswers: 1, correctAnswers: 1 };
}

describe('buildSession', () => {
  it('respects sessionSize', () => {
    expect(buildSession(['all'], {}, 7)).toHaveLength(7);
    expect(buildSession(['all'], {}, 20)).toHaveLength(20);
  });

  it('filters by region', () => {
    const session = buildSession(['europe'], {}, 10);
    expect(session).toHaveLength(10);
    session.forEach(c => expect(c.region).toBe('europe'));
  });

  it('supports multiple regions', () => {
    const session = buildSession(['europe', 'africa'], {}, 30);
    session.forEach(c => expect(['europe', 'africa']).toContain(c.region));
  });

  it('never repeats a country within a session', () => {
    // oceania has fewer countries than the default session size, which
    // used to duplicate entries because unseen countries counted as "due".
    const session = buildSession(['oceania'], {}, 20);
    const codes = session.map(c => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(session.length).toBeLessThanOrEqual(20);
  });

  it('prioritizes due cards, then unseen, then seen', () => {
    const europe = countries.filter(c => c.region === 'europe');
    const dueCodes = europe.slice(0, 3).map(c => c.code);
    const unseenCodes = europe.slice(3, 5).map(c => c.code);
    const progress = {};
    europe.forEach(c => {
      if (dueCodes.includes(c.code)) progress[c.code] = seenCard(PAST);
      else if (!unseenCodes.includes(c.code)) progress[c.code] = seenCard(FUTURE);
    });

    const session = buildSession(['europe'], progress, 6);
    const codes = session.map(c => c.code);
    // First the 3 due cards, then the 2 unseen, then 1 not-yet-due filler.
    expect(new Set(codes.slice(0, 3))).toEqual(new Set(dueCodes));
    expect(new Set(codes.slice(3, 5))).toEqual(new Set(unseenCodes));
    expect(progress[codes[5]].dueDate).toBe(FUTURE);
  });

  it('falls back to seen cards when nothing is due or unseen', () => {
    const progress = {};
    countries.forEach(c => { progress[c.code] = seenCard(FUTURE); });
    const session = buildSession(['all'], progress, 5);
    expect(session).toHaveLength(5);
  });
});

describe('buildReviewSession', () => {
  it('returns exactly the requested codes', () => {
    const codes = ['fr', 'de', 'it', 'jp'];
    const session = buildReviewSession(codes);
    expect(new Set(session.map(c => c.code))).toEqual(new Set(codes));
    expect(session).toHaveLength(4);
  });

  it('ignores unknown codes and returns [] for empty input', () => {
    expect(buildReviewSession(['zz'])).toEqual([]);
    expect(buildReviewSession([])).toEqual([]);
  });
});

describe('getChoices', () => {
  const norway = countries.find(c => c.code === 'no');
  const japan = countries.find(c => c.code === 'jp');

  it('returns 4 unique choices including the correct country', () => {
    for (let i = 0; i < 25; i++) {
      const choices = getChoices(japan, countries, ['all']);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(c => c.code)).size).toBe(4);
      expect(choices.map(c => c.code)).toContain('jp');
    }
  });

  it('fills with the confusable group in confusables mode', () => {
    // Norway belongs to the Nordic cross group: no / is / dk / fi.
    const group = getConfusableGroup('no');
    expect(group).toEqual(expect.arrayContaining(['no', 'is', 'dk', 'fi']));
    for (let i = 0; i < 10; i++) {
      const choices = getChoices(norway, countries, ['all'], true);
      expect(new Set(choices.map(c => c.code))).toEqual(new Set(['no', 'is', 'dk', 'fi']));
    }
  });

  it('includes at most a slice of look-alikes outside confusables mode', () => {
    for (let i = 0; i < 10; i++) {
      const choices = getChoices(norway, countries, ['all'], false);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(c => c.code)).size).toBe(4);
      expect(choices.map(c => c.code)).toContain('no');
    }
  });
});

describe('getCapitalChoices', () => {
  const france = countries.find(c => c.code === 'fr');

  it('returns 4 unique entries including the correct one', () => {
    for (let i = 0; i < 25; i++) {
      const choices = getCapitalChoices(france, countries, ['all']);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(c => c.code)).size).toBe(4);
      expect(choices.map(c => c.code)).toContain('fr');
    }
  });

  it('prefers same-region distractors when enough exist', () => {
    const choices = getCapitalChoices(france, countries, ['all']);
    choices.forEach(c => expect(c.region).toBe('europe'));
  });
});
