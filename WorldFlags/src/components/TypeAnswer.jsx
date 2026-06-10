import { useState, useEffect, useRef } from 'react';

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

  // Levenshtein for longer answers (handles minor typos)
  if (normTarget.length > 5) {
    const dist = levenshtein(expanded, normTarget);
    if (dist <= 2) return true;
  }

  return false;
}

// --- Component ---

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

  // Auto-focus and reset whenever the question changes (new `correct` prop)
  useEffect(() => {
    setValue('');
    setFeedback(null);
    // Small defer so the DOM is ready after re-render
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [correct]);

  function submit() {
    if (feedback) return; // already submitted, waiting for advance
    const result = isCorrectAnswer(value, correct);
    setFeedback(result ? 'correct' : 'wrong');
    onAnswer(correct.code, result);

    setTimeout(() => {
      setFeedback(null);
      if (isLast) {
        onDone();
      } else {
        onNext();
      }
    }, 1400);
  }

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
        <div className="type-answer-feedback type-answer-feedback--correct">
          <span className="type-answer-feedback-icon">✓</span>
          Correct!
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="type-answer-feedback type-answer-feedback--wrong">
          <span className="type-answer-feedback-icon">✗</span>
          Wrong — it was <strong>{correct.name}</strong>
        </div>
      )}
    </div>
  );
}
