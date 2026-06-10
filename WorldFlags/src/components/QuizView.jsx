import { useState, useEffect, useCallback } from 'react';
import { countries } from '../data/countries.js';
import { getChoices } from '../hooks/useQuiz.js';
import ProgressBar from './ProgressBar.jsx';
import FlagCard from './FlagCard.jsx';
import AnswerGrid from './AnswerGrid.jsx';
import FeedbackOverlay from './FeedbackOverlay.jsx';
import TypeAnswer from './TypeAnswer.jsx';

const ADVANCE_DELAY = 1400;

export default function QuizView({
  session,
  sessionIndex,
  sessionResults,
  progress,
  selectedRegions,
  onAnswer,
  onNext,
  onDone,
  onHome,
  onRestartQuiz,
  quizMode,
}) {
  const isDone = sessionIndex >= session.length;
  const current = session[sessionIndex];

  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Build new choices whenever the question changes
  useEffect(() => {
    if (current) {
      setChoices(getChoices(current, countries, selectedRegions));
      setFeedback(null);
    }
  }, [current, selectedRegions]);

  const handleSelect = useCallback((selectedCode) => {
    if (feedback) return;
    const correct = selectedCode === current.code;
    const fb = { correct, correctCode: current.code, selectedCode };
    setFeedback(fb);
    onAnswer(current.code, correct);

    setTimeout(() => {
      setFeedback(null);
      if (sessionIndex + 1 >= session.length) {
        onDone();
      } else {
        onNext();
      }
    }, ADVANCE_DELAY);
  }, [feedback, current, sessionIndex, session.length, onAnswer, onNext, onDone]);

  // Keyboard shortcuts (multiple-choice mode only)
  useEffect(() => {
    if (quizMode === 'typing') return;
    function onKey(e) {
      if (isDone) return;
      if (feedback) return;
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (choices[idx]) handleSelect(choices[idx].code);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, feedback, isDone, handleSelect, quizMode]);

  if (isDone) {
    const correct = sessionResults.filter(r => r.correct).length;
    const total = sessionResults.length;
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
            {sessionResults.map((r, i) => {
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

      <FlagCard code={current.code} />

      {quizMode === 'typing' ? (
        <TypeAnswer
          correct={current}
          onAnswer={onAnswer}
          onNext={onNext}
          onDone={onDone}
          isLast={sessionIndex + 1 >= session.length}
        />
      ) : (
        <>
          <AnswerGrid
            choices={choices}
            onSelect={handleSelect}
            feedback={feedback}
            disabled={!!feedback}
          />

          {feedback
            ? <FeedbackOverlay feedback={feedback} />
            : <p className="keyboard-hint">Press 1–4 to answer</p>
          }
        </>
      )}
    </div>
  );
}
