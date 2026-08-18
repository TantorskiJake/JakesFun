import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  preloadFlags,
  preloadAllFlags,
  isFlagLoaded,
  setFlagLoader,
} from './preloadFlags.js';
import { countries } from '../data/countries.js';

afterEach(() => {
  setFlagLoader(null);
});

describe('preloadFlags', () => {
  it('loads every requested flag and marks them cached', async () => {
    const seen = [];
    setFlagLoader((url) => {
      seen.push(url);
      return Promise.resolve(true);
    });

    await preloadFlags(['fr', 'de']);

    expect(isFlagLoaded('fr')).toBe(true);
    expect(isFlagLoaded('de')).toBe(true);
    expect(seen).toContain('https://flagcdn.com/w320/fr.png');
    expect(seen).toContain('https://flagcdn.com/w320/de.png');
  });

  it('does not re-fetch a flag that is already cached', async () => {
    const loader = vi.fn(() => Promise.resolve(true));
    setFlagLoader(loader);

    await preloadFlags(['es']);
    await preloadFlags(['es']);

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates codes within a single call', async () => {
    const loader = vi.fn(() => Promise.resolve(true));
    setFlagLoader(loader);

    await preloadFlags(['it', 'it', 'it']);

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('resolves even when a flag fails to load', async () => {
    setFlagLoader(() => Promise.resolve(false));

    await expect(preloadFlags(['zz'])).resolves.toBeDefined();
    // A failed flag is still marked settled so it is not retried forever.
    expect(isFlagLoaded('zz')).toBe(true);
  });

  it('handles an empty list without loading anything', async () => {
    const loader = vi.fn(() => Promise.resolve(true));
    setFlagLoader(loader);

    await preloadFlags([]);

    expect(loader).not.toHaveBeenCalled();
  });
});

describe('preloadAllFlags', () => {
  it('requests a flag for every country', async () => {
    const loaded = new Set();
    setFlagLoader((url) => {
      loaded.add(url);
      return Promise.resolve(true);
    });

    await preloadAllFlags();

    for (const c of countries) {
      expect(isFlagLoaded(c.code)).toBe(true);
    }
  });
});
