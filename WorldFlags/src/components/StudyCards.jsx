import { useState, useEffect, useCallback, useRef } from 'react';
import { getFlagUrl } from '../data/countries.js';

const SWIPE_THRESHOLD = 40;

// Paged study cards shown before a quiz when the session contains
// flags the user has never been quizzed on.
export default function StudyCards({ countries, onStart }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  // Restart from the first card whenever a new batch arrives
  useEffect(() => setIndex(0), [countries]);

  const isLast = index >= countries.length - 1;
  const current = countries[Math.min(index, countries.length - 1)];

  const goBack = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    if (index >= countries.length - 1) {
      onStart();
    } else {
      setIndex(i => i + 1);
    }
  }, [index, countries.length, onStart]);

  // Arrow keys page, Enter/Space advances (and starts the quiz on the last card)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex(i => Math.min(countries.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Focused buttons already handle Enter/Space via their click event
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [countries.length, goBack, goNext]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx <= -SWIPE_THRESHOLD) {
      setIndex(i => Math.min(countries.length - 1, i + 1));
    } else if (dx >= SWIPE_THRESHOLD) {
      goBack();
    }
  }, [countries.length, goBack]);

  if (!current) return null;

  return (
    <div className="study-cards">
      <p className="study-cards-kicker">
        Learning {countries.length} new flag{countries.length === 1 ? '' : 's'}
      </p>

      <div
        className="study-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={current.code}
          src={getFlagUrl(current.code)}
          alt={`Flag of ${current.name}`}
          className="study-card-flag"
        />
        <h2 className="study-card-name">{current.name}</h2>
        <p className="study-card-meta">
          Capital: {current.capital} · <span className="study-card-region">{current.region}</span>
        </p>
      </div>

      <div className="study-cards-actions">
        <button className="btn-ghost" onClick={goBack} disabled={index === 0}>
          ← Back
        </button>
        <span className="study-cards-counter">{index + 1} / {countries.length}</span>
        <button className="btn-primary" onClick={goNext}>
          {isLast ? 'Start quiz' : 'Next →'}
        </button>
      </div>

      <p className="keyboard-hint">Use ← → to browse · Enter to continue</p>
    </div>
  );
}
