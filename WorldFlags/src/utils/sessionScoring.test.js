import { describe, expect, it } from 'vitest';
import { validateSessionResult, validateSessionResults, xpForSession } from './sessionScoring.js';

describe('validateSessionResult', () => {
  it('accepts bounded whole-number session results', () => {
    expect(validateSessionResult(18, 20)).toEqual({ valid: true, correct: 18, total: 20 });
    expect(validateSessionResult(50, 50)).toEqual({ valid: true, correct: 50, total: 50 });
  });

  it('rejects impossible or oversized session results', () => {
    expect(validateSessionResult(21, 20).valid).toBe(false);
    expect(validateSessionResult(-1, 20).valid).toBe(false);
    expect(validateSessionResult(1, 0).valid).toBe(false);
    expect(validateSessionResult(51, 51).valid).toBe(false);
  });

  it('rejects non-integer session results', () => {
    expect(validateSessionResult(1.5, 20).valid).toBe(false);
    expect(validateSessionResult(1, 20.5).valid).toBe(false);
  });
});

describe('xpForSession', () => {
  it('scores regular and perfect sessions like the streak hook', () => {
    expect(xpForSession(18, 20)).toBe(180);
    expect(xpForSession(20, 20)).toBe(250);
  });

  it('returns 0 for invalid sessions', () => {
    expect(xpForSession(999, 20)).toBe(0);
  });
});

describe('validateSessionResults', () => {
  it('accepts replayable selected-code and typed answers', () => {
    expect(validateSessionResults([
      { code: 'FR', selectedCode: 'fr', mode: 'classic' },
      { code: 'jp', answerText: 'Japan', mode: 'typing' },
    ])).toEqual({
      valid: true,
      answers: [
        { code: 'fr', selectedCode: 'fr', answerText: null, mode: 'classic' },
        { code: 'jp', selectedCode: null, answerText: 'Japan', mode: 'typing' },
      ],
    });
  });

  it('rejects malformed answer payloads', () => {
    expect(validateSessionResults([]).valid).toBe(false);
    expect(validateSessionResults([{ code: 'fra', selectedCode: 'fr' }]).valid).toBe(false);
    expect(validateSessionResults([{ code: 'fr', selectedCode: 'fra' }]).valid).toBe(false);
    expect(validateSessionResults([{ code: 'fr', answerText: 'x'.repeat(121) }]).valid).toBe(false);
  });
});
