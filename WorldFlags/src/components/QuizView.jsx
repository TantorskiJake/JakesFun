import { useState, useEffect, useCallback, useRef } from 'react';
import { countries, getFlagUrl } from '../data/countries.js';
import { getChoices, getCapitalChoices } from '../hooks/useQuiz.js';
import ProgressBar from './ProgressBar.jsx';
import FlagCard from './FlagCard.jsx';
import AnswerGrid from './AnswerGrid.jsx';
import FlagChoiceGrid from './FlagChoiceGrid.jsx';
import FeedbackOverlay, { showsComparison } from './FeedbackOverlay.jsx';
import TypeAnswer from './TypeAnswer.jsx';
import StudyCards from './StudyCards.jsx';
import MapAnswer from './MapAnswer.jsx';

// Correct answers advance quickly; wrong ones linger so the fix sinks in.
const CORRECT_DELAY = 900;
const WRONG_DELAY = 2200;
// Confusable misses show a side-by-side flag comparison, so give it longer.
const COMPARE_DELAY = 3500;

export default function QuizView({
  session,
  sessionIndex,
  sessionResults,
  progress,
  selectedRegions,
  quizMode,
  sessionType = 'normal',
  onAnswer,
  onNext,
  onDone,
  onSessionComplete,
  onHome,
  onRestartQuiz,
  onReviewMissed,
}) {
  const isDone = sessionIndex >= session.length;
  const current = session[sessionIndex];
  const isCapitals = quizMode === 'capitals';
  const isConfusables = quizMode === 'confusables';
  const isMap = quizMode === 'map';

  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null);
  // Countries in this session the user has never been quizzed on;
  // shown as study cards before question 1 (null once dismissed).
  const [studyList, setStudyList] = useState(null);
  // Track whether we've already fired onSessionComplete for this session
  const [sessionRecorded, setSessionRecorded] = useState(false);
  const advanceTimerRef = useRef(null);

  // Snapshot progress via a ref so the study list is computed once per
  // session instead of re-running as answers update progress mid-quiz.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Decide the study phase when a new session arrives (skip for reviews)
  useEffect(() => {
    if (sessionType === 'review') {
      setStudyList(null);
      return;
    }
    const unseen = session.filter(c => !progressRef.current[c.code]);
    setStudyList(unseen.length > 0 ? unseen : null);
  }, [session, sessionType]);

  // Build new choices whenever the question changes
  useEffect(() => {
    if (current) {
      setChoices(isMap
        ? []
        : isCapitals
          ? getCapitalChoices(current, countries, selectedRegions)
          : getChoices(current, countries, selectedRegions, isConfusables));
      setFeedback(null);
    }
  }, [current, selectedRegions, isCapitals, isConfusables, isMap]);

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
      onSessionComplete?.(correct, total, sessionResults);
      setSessionRecorded(true);
    }
  }, [isDone, sessionRecorded, sessionResults, onSessionComplete]);

  // Clear any pending advance timer on unmount
  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  const advance = useCallback(() => {
    if (!advanceTimerRef.current) return;
    clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setFeedback(null);
    if (sessionIndex + 1 >= session.length) {
      onDone();
    } else {
      onNext();
    }
  }, [sessionIndex, session.length, onDone, onNext]);

  const handleSelect = useCallback((selectedCode) => {
    if (feedback) return;
    const correct = selectedCode === current.code;
    setFeedback({ correct, correctCode: current.code, selectedCode });
    onAnswer(current.code, correct);
    const wrongDelay = showsComparison(current.code, selectedCode, isCapitals ? 'capital' : 'name')
      ? COMPARE_DELAY
      : WRONG_DELAY;
    advanceTimerRef.current = setTimeout(advance, correct ? CORRECT_DELAY : wrongDelay);
  }, [feedback, current, onAnswer, advance, isCapitals]);

  // Keyboard shortcuts (multiple-choice modes)
  useEffect(() => {
    if (quizMode === 'typing') return;
    function onKey(e) {
      if (isDone || studyList) return;
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advance();
        }
        return;
      }
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1;
        if (choices[idx]) handleSelect(choices[idx].code);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, feedback, isDone, studyList, handleSelect, advance, quizMode]);

  if (isDone) {
    const correct = sessionResults.filter(r => r.correct).length;
    const total = sessionResults.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const isReview = sessionType === 'review';
    const xpEarned = isReview ? 0 : correct * 10 + (correct === total && total > 0 ? 50 : 0);
    const missedCodes = [...new Set(sessionResults.filter(r => !r.correct).map(r => r.code))];

    return (
      <div className="quiz-view">
        <div className="session-complete">
          <h2>Lesson complete</h2>
          <div className="session-score">{pct}%</div>
          <p>{correct} of {total} remembered</p>
          {!isReview && <div className="session-xp-earned">+{xpEarned} XP</div>}

          <div className="session-results-grid">
            {sessionResults.map((r, i) => {
              const c = session[i];
              return (
                <div
                  key={`${c.code}-${i}`}
                  className={`session-result-item session-result-item--${r.correct ? 'correct' : 'wrong'}`}
                >
                  <img src={getFlagUrl(c.code)} alt="" className="session-result-flag" />
                  {r.correct ? '✓' : '✗'} {c.name}
                </div>
              );
            })}
          </div>

          <div className="session-complete-actions">
            <button className="btn-ghost" onClick={onHome}>Home</button>
            {missedCodes.length > 0 && onReviewMissed && (
              <button className="btn-secondary" onClick={() => onReviewMissed(missedCodes)}>
                Review {missedCodes.length} missed
              </button>
            )}
            <button className="btn-primary" onClick={onRestartQuiz}>Practice again</button>
          </div>
        </div>
      </div>
    );
  }

  // Study phase: introduce unseen flags before the first question
  if (studyList) {
    return (
      <div className="quiz-view">
        <div className="quiz-header">
          <button className="quiz-back-btn" onClick={onHome}>← Home</button>
        </div>
        <StudyCards countries={studyList} onStart={() => setStudyList(null)} />
      </div>
    );
  }

  return (
    <div className="quiz-view" onClick={feedback ? advance : undefined}>
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
      ) : quizMode === 'map' ? (
        <MapAnswer
          target={current}
          onSelect={handleSelect}
          feedback={feedback}
        />
      ) : (
        <AnswerGrid
          choices={choices}
          onSelect={handleSelect}
          feedback={feedback}
          disabled={!!feedback}
          labelKey={isCapitals ? 'capital' : 'name'}
        />
      )}

      {quizMode !== 'typing' && (
        feedback
          ? <FeedbackOverlay feedback={feedback} labelKey={isCapitals ? 'capital' : 'name'} />
          : <p className="keyboard-hint">{quizMode === 'reverse' ? 'Choose a flag to continue' : quizMode === 'map' ? 'Find this country on the map' : 'Press 1–4 to continue'}</p>
      )}
    </div>
  );
}
