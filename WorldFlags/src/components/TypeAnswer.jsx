import { useState, useEffect, useRef } from 'react';
import { countries } from '../data/countries';

// --- Matching utilities ---

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const ABBREVIATIONS = {
  usa: 'united states',
  'u.s.a.': 'united states',
  'u.s.': 'united states',
  us: 'united states',
  uk: 'united kingdom',
  'u.k.': 'united kingdom',
  uae: 'united arab emirates',
  drc: 'democratic republic of the congo',
  'dr congo': 'democratic republic of the congo',
  car: 'central african republic',
};

function normalize(str) {
  let s = str.toLowerCase().trim();
  // Strip leading/trailing "the"
  s = s.replace(/^the\s+/, '').replace(/\s+the$/, '');
  return s;
}

export function isCorrectAnswer(input, country) {
  const rawInput = input.trim();
  if (!rawInput) return false;

  const normInput = normalize(rawInput);
  const normTarget = normalize(country.name);

  // Expand abbreviation if present
  const expanded = ABBREVIATIONS[normInput] ?? normInput;

  // Exact match (after normalization or abbreviation expansion)
  if (normInput === normTarget || expanded === normTarget) return true;

  // Levenshtein for longer answers (handles minor typos). Confusable
  // country names (Niger/Nigeria, Austria/Australia) sit within typo
  // distance of each other, so a fuzzy match only counts when the input
  // is strictly closer to the target than to every other country name.
  if (normTarget.length > 5) {
    const dist = levenshtein(expanded, normTarget);
    if (dist <= 2 && dist < distanceToNearestOtherCountry(expanded, normTarget)) {
      return true;
    }
  }

  return false;
}

let normalizedCountryNames = null;

function distanceToNearestOtherCountry(input, normTarget) {
  if (!normalizedCountryNames) {
    normalizedCountryNames = countries.map(c => normalize(c.name));
  }
  let nearest = Infinity;
  for (const name of normalizedCountryNames) {
    if (name === normTarget) continue;
    // Cheap lower bound: distance is at least the length difference.
    if (Math.abs(name.length - input.length) >= nearest) continue;
    const d = levenshtein(input, name);
    if (d < nearest) nearest = d;
  }
  return nearest;
}

// --- Component ---

// Correct answers advance quickly; wrong ones linger so the fix sinks in.
const CORRECT_DELAY = 900;
const WRONG_DELAY = 2200;

export default function TypeAnswer({
  correct,
  onAnswer,
  onNext,
  onDone,
  isLast,
}) {
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const inputRef = useRef(null);
  const advanceTimerRef = useRef(null);

  // Auto-focus and reset whenever the question changes (new `correct` prop)
  useEffect(() => {
    setValue('');
    setFeedback(null);
    // Small defer so the DOM is ready after re-render
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [correct]);

  function advance() {
    if (!advanceTimerRef.current) return;
    clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setFeedback(null);
    if (isLast) {
      onDone();
    } else {
      onNext();
    }
  }

  function submit() {
    if (feedback) return; // already submitted, waiting for advance
    const result = isCorrectAnswer(value, correct);
    setFeedback(result ? 'correct' : 'wrong');
    onAnswer(correct.code, result);
    advanceTimerRef.current = setTimeout(advance, result ? CORRECT_DELAY : WRONG_DELAY);
  }

  // Enter/Space (or a tap on the feedback banner) skips the advance delay
  useEffect(() => {
    if (!feedback) return;
    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function handleKeyDown(e) {
    if (e.key === 'Enter') submit();
  }

  const submitted = feedback !== null;

  return (
    <div className="type-answer">
      <div className="type-answer-row">
        <input
          ref={inputRef}
          type="text"
          className="type-answer-input"
          placeholder="Type the country name…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          className="type-answer-btn"
          onClick={submit}
          disabled={submitted || !value.trim()}
        >
          Check
        </button>
      </div>

      {feedback === 'correct' && (
        <div className="type-answer-feedback type-answer-feedback--correct" onClick={advance}>
          <span className="type-answer-feedback-icon">✓</span>
          Nice. That&rsquo;s {correct.name}
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="type-answer-feedback type-answer-feedback--wrong" onClick={advance}>
          <span className="type-answer-feedback-icon">✗</span>
          Almost. This one is <strong>{correct.name}</strong>
        </div>
      )}
    </div>
  );
}
