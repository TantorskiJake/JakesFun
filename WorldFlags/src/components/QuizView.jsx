import { useState, useEffect, useCallback } from 'react';
import { countries } from '../data/countries.js';
import { getChoices, getCapitalChoices } from '../hooks/useQuiz.js';
import ProgressBar from './ProgressBar.jsx';
import FlagCard from './FlagCard.jsx';
import AnswerGrid from './AnswerGrid.jsx';
import FlagChoiceGrid from './FlagChoiceGrid.jsx';
import FeedbackOverlay from './FeedbackOverlay.jsx';
import TypeAnswer from './TypeAnswer.jsx';

const ADVANCE_DELAY = 1400;

export default function QuizView({
  session,
  sessionIndex,
  sessionResults,
  progress,
  selectedRegions,
  quizMode,
  onAnswer,
  onNext,
  onDone,
  onSessionComplete,
  onHome,
  onRestartQuiz,
}) {
  const isDone = sessionIndex >= session.length;
  const current = session[sessionIndex];
  const isCapitals = quizMode === 'capitals';

  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null);
  // Track whether we've already fired onSessionComplete for this session
  const [sessionRecorded, setSessionRecorded] = useState(false);

  // Build new choices whenever the question changes
  useEffect(() => {
    if (current) {
      const fn = isCapitals ? getCapitalChoices : getChoices;
      setChoices(fn(current, countries, selectedRegions));
      setFeedback(null);
    }
  }, [current, selectedRegions, isCapitals]);

  // Reset recorded flag when a new session starts
  useEffect(() => {
    if (!isDone) {
      setSessionRecorded(false);
    }
  }, [isDone]);

  // Fire onSessionComplete exactly once when the results screen appears
  useEffect(() => {
    if (isDone && !sessionRecorded && sessionResults.length > 0) {
      const correct = sessionResults.filter(r => r.correct).length;
      const total = sessionResults.length;
      onSessionComplete?.(correct, total);
      setSessionRecorded(true);
    }
  }, [isDone, sessionRecorded, sessionResults, onSessionComplete]);

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
    const xpEarned = correct * 10 + (correct === total && total > 0 ? 50 : 0);

    return (
      <div className="quiz-view">
        <div className="session-complete">
          <h2>Lesson complete</h2>
          <div className="session-score">{pct}%</div>
          <p>{correct} of {total} remembered</p>
          <div className="session-xp-earned">+{xpEarned} XP</div>

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
            <button className="btn-primary" onClick={onRestartQuiz}>Practice again</button>
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

      {quizMode === 'reverse' ? (
        <div className="reverse-question">
          <p className="flag-card-prompt">Find this flag</p>
          <h2 className="reverse-country-name">{current.name}</h2>
        </div>
      ) : (
        <FlagCard code={current.code} />
      )}

      {isCapitals && (
        <p className="quiz-capital-label">Remember the capital</p>
      )}

      {quizMode === 'typing' ? (
        <TypeAnswer
          correct={current}
          onAnswer={onAnswer}
          onNext={onNext}
          onDone={onDone}
          isLast={sessionIndex + 1 >= session.length}
        />
      ) : quizMode === 'reverse' ? (
        <FlagChoiceGrid
          choices={choices}
          onSelect={handleSelect}
          feedback={feedback}
          disabled={!!feedback}
        />
      ) : isCapitals ? (
        <AnswerGrid
          choices={choices}
          onSelect={handleSelect}
          feedback={feedback}
          disabled={!!feedback}
          labelKey="capital"
        />
      ) : (
        <AnswerGrid
          choices={choices}
          onSelect={handleSelect}
          feedback={feedback}
          disabled={!!feedback}
        />
      )}

      {quizMode !== 'typing' && (
        feedback
          ? <FeedbackOverlay feedback={feedback} labelKey={isCapitals ? 'capital' : 'name'} />
          : <p className="keyboard-hint">{quizMode === 'reverse' ? 'Choose a flag to continue' : 'Press 1–4 to continue'}</p>
      )}
    </div>
  );
}
