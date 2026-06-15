import { useState, useEffect, useCallback } from 'react';
import { countries } from '../data/countries.js';
import { getChoices } from '../hooks/useQuiz.js';
import ProgressBar from './ProgressBar.jsx';
import FlagCard from './FlagCard.jsx';
import AnswerGrid from './AnswerGrid.jsx';
import FlagAnswerGrid from './FlagAnswerGrid.jsx';
import FeedbackOverlay from './FeedbackOverlay.jsx';

const ADVANCE_DELAY = 1400;

// Prompt card for reverse mode (show country name, pick the flag)
function CountryNameCard({ name, region }) {
  return (
    <div className="country-name-card">
      <p className="flag-card-prompt">Which flag belongs to this country?</p>
      <div className="country-name-display">
        <span className="country-name-text">{name}</span>
        <span className="country-name-region">{region}</span>
      </div>
    </div>
  );
}

export default function QuizView({
  session,
  sessionIndex,
  progress,
  selectedRegions,
  mode,
  onAnswer,
  onNext,
  onDone,
  onHome,
  onRestartQuiz,
}) {
  const isReverse = mode === 'reverse';
  const isConfusables = mode === 'confusables';

  const isDone = sessionIndex >= session.length;
  const current = session[sessionIndex];

  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null);
  // Track results locally so we can pass them to onDone
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (current) {
      setChoices(getChoices(current, countries, selectedRegions, isConfusables));
      setFeedback(null);
    }
  }, [current, selectedRegions, isConfusables]);

  const handleSelect = useCallback((selectedCode) => {
    if (feedback) return;
    const correct = selectedCode === current.code;
    const fb = { correct, correctCode: current.code, selectedCode };
    const newResult = { code: current.code, correct };
    const newResults = [...results, newResult];

    setFeedback(fb);
    setResults(newResults);
    onAnswer(current.code, correct);

    setTimeout(() => {
      setFeedback(null);
      if (sessionIndex + 1 >= session.length) {
        onDone(newResults);
      } else {
        onNext();
      }
    }, ADVANCE_DELAY);
  }, [feedback, current, sessionIndex, session.length, results, onAnswer, onNext, onDone]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (isDone || feedback) return;
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (choices[idx]) handleSelect(choices[idx].code);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, feedback, isDone, handleSelect]);

  // Session complete screen
  if (isDone) {
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪';

    return (
      <div className="quiz-view">
        <div className="session-complete">
          <div className="session-complete-emoji">{emoji}</div>
          <h2>Session Complete!</h2>
          <div className="session-score">{pct}%</div>
          <p>{correct} of {total} correct</p>
          <div className="session-results-grid">
            {results.map((r, i) => {
              const c = session[i];
              return (
                <div
                  key={`${c.code}-${i}`}
                  className={`session-result-item session-result-item--${r.correct ? 'correct' : 'wrong'}`}
                >
                  {r.correct ? '✓' : '✗'} {c.name}
                </div>
              );
            })}
          </div>
          <div className="session-complete-actions">
            <button className="btn-ghost" onClick={onHome}>Home</button>
            <button className="btn-primary" onClick={onRestartQuiz}>Study Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <button className="quiz-back-btn" onClick={onHome}>← Home</button>
        <div className="quiz-progress-wrap">
          <ProgressBar value={sessionIndex / session.length} />
        </div>
        <span className="quiz-counter">{sessionIndex + 1} / {session.length}</span>
      </div>

      {isReverse
        ? <CountryNameCard name={current.name} region={current.region} />
        : <FlagCard code={current.code} />
      }

      {isReverse
        ? <FlagAnswerGrid
            choices={choices}
            onSelect={handleSelect}
            feedback={feedback}
            disabled={!!feedback}
          />
        : <AnswerGrid
            choices={choices}
            onSelect={handleSelect}
            feedback={feedback}
            disabled={!!feedback}
          />
      }

      {feedback
        ? <FeedbackOverlay feedback={feedback} />
        : <p className="keyboard-hint">Press 1–4 to answer</p>
      }
    </div>
  );
}
