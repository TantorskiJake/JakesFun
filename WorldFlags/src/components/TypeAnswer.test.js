import { describe, it, expect } from 'vitest';
import { isCorrectAnswer } from './TypeAnswer.jsx';
import { countries } from '../data/countries';

function country(name) {
  const found = countries.find(c => c.name === name);
  if (!found) throw new Error(`No such country in data: ${name}`);
  return found;
}

describe('isCorrectAnswer — exact and normalized matches', () => {
  it('matches the exact name', () => {
    expect(isCorrectAnswer('France', country('France'))).toBe(true);
  });

  it('is case- and whitespace-insensitive', () => {
    expect(isCorrectAnswer('  fRaNcE  ', country('France'))).toBe(true);
    expect(isCorrectAnswer('NEW ZEALAND', country('New Zealand'))).toBe(true);
  });

  it('rejects empty or whitespace-only input', () => {
    expect(isCorrectAnswer('', country('France'))).toBe(false);
    expect(isCorrectAnswer('   ', country('France'))).toBe(false);
  });

  it('strips a leading "the"', () => {
    expect(isCorrectAnswer('The Netherlands', country('Netherlands'))).toBe(true);
    expect(isCorrectAnswer('the Gambia', country('Gambia'))).toBe(true);
  });
});

describe('isCorrectAnswer — abbreviations', () => {
  it.each([
    ['usa', 'United States'],
    ['USA', 'United States'],
    ['u.s.a.', 'United States'],
    ['us', 'United States'],
    ['uk', 'United Kingdom'],
    ['u.k.', 'United Kingdom'],
    ['uae', 'United Arab Emirates'],
    ['drc', 'Democratic Republic of the Congo'],
    ['dr congo', 'Democratic Republic of the Congo'],
    ['car', 'Central African Republic'],
  ])('accepts %s for %s', (input, target) => {
    expect(isCorrectAnswer(input, country(target))).toBe(true);
  });
});

describe('isCorrectAnswer — typo tolerance', () => {
  it('accepts small typos in longer names', () => {
    expect(isCorrectAnswer('germny', country('Germany'))).toBe(true);
    expect(isCorrectAnswer('swtzerland', country('Switzerland'))).toBe(true);
    expect(isCorrectAnswer('nigerria', country('Nigeria'))).toBe(true);
    expect(isCorrectAnswer('australlia', country('Australia'))).toBe(true);
  });

  it('does not fuzzy-match short names', () => {
    // Targets of 5 characters or fewer require an exact match.
    expect(isCorrectAnswer('chinna', country('China'))).toBe(false);
    expect(isCorrectAnswer('chile', country('China'))).toBe(false);
  });

  it('rejects clearly wrong answers', () => {
    expect(isCorrectAnswer('germany', country('France'))).toBe(false);
    expect(isCorrectAnswer('xyz', country('Portugal'))).toBe(false);
  });
});

describe('isCorrectAnswer — confusable country names never match each other', () => {
  // These pairs are within the raw levenshtein threshold (distance <= 2)
  // of each other, so a naive fuzzy matcher would accept them. The matcher
  // must require the input to be strictly closer to the target than to any
  // other country name.
  it.each([
    ['niger', 'Nigeria'],
    ['nigeria', 'Niger'],
    ['austria', 'Australia'],
    ['australia', 'Austria'],
    ['slovakia', 'Slovenia'],
    ['slovenia', 'Slovakia'],
    ['iran', 'Iraq'],
    ['iraq', 'Iran'],
    ['india', 'Indonesia'],
  ])('rejects "%s" as an answer for %s', (input, target) => {
    expect(isCorrectAnswer(input, country(target))).toBe(false);
  });
});
