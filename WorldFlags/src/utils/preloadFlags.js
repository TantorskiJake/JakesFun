import { countries, getFlagUrl } from '../data/countries.js';

// Flags are fetched from a CDN on demand, so the first time one appears in a
// quiz the browser has to download it — that's the mid-study spinner/buffering.
// This module warms the browser's image cache ahead of time: once a flag has
// been fetched here, the <img> in FlagCard/StudyCards renders it instantly.

// Codes whose image has finished fetching (loaded or failed — see below).
const loaded = new Set();
// In-flight fetches, so we never kick off a second request for the same flag.
const inFlight = new Map();

// Default loader: start an <img> fetch so the browser caches the flag.
// Resolves on load OR error — a flag that fails to load shouldn't block the
// study session (FlagCard has its own "Flag not available" fallback), and we
// don't want to retry it forever.
function imageLoader(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

let currentLoader = imageLoader;

// Test seam: swap the underlying loader (pass nothing to restore the default).
export function setFlagLoader(loader) {
  currentLoader = loader || imageLoader;
}

export function isFlagLoaded(code) {
  return loaded.has(code);
}

function preloadOne(code) {
  if (loaded.has(code)) return Promise.resolve();
  const existing = inFlight.get(code);
  if (existing) return existing;
  const p = currentLoader(getFlagUrl(code)).then(() => {
    loaded.add(code);
    inFlight.delete(code);
  });
  inFlight.set(code, p);
  return p;
}

// Preload a set of flags, resolving once every one has settled (loaded or
// failed). Safe to call repeatedly — already-cached flags are skipped.
export function preloadFlags(codes) {
  const unique = [...new Set(codes)];
  return Promise.all(unique.map(preloadOne));
}

// Warm the cache with every flag in the app, for background prefetching.
export function preloadAllFlags() {
  return preloadFlags(countries.map((c) => c.code));
}
