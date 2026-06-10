import { countries } from '../data/countries.js';
import { isDue } from '../utils/sm2.js';
import RegionFilter from './RegionFilter.jsx';

export default function HomeView({
  dueCount,
  masteredCount,
  totalCount,
  selectedRegions,
  onRegionsChange,
  onStartQuiz,
  onStartTrickyDrill,
  onResetProgress,
  progress,
  streak,
  quizMode,
  onQuizModeChange,
}) {
  const pool = selectedRegions.includes('all')
    ? countries
    : countries.filter(c => selectedRegions.includes(c.region));

  const poolDue = pool.filter(c => isDue(progress[c.code])).length;
  const canStart = pool.length > 0;

  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onResetProgress();
    }
  }

  const seenCount = Object.keys(progress).length;
  const totalAnswers = Object.values(progress).reduce((s, c) => s + c.totalAnswers, 0);
  const totalCorrect = Object.values(progress).reduce((s, c) => s + c.correctAnswers, 0);
  const accuracy = totalAnswers === 0 ? null : Math.round((totalCorrect / totalAnswers) * 100);

  const { currentStreak, longestStreak, totalXP, level } = streak ?? {};
  const showStreak = totalXP > 0;
  const xpInLevel = totalXP % 200;
  const xpProgress = xpInLevel / 200;

  return (
    <div className="home-view">
      <div className="home-hero">
        <h1>Learn Every Flag</h1>
        <p>Master all {totalCount} world flags with spaced repetition</p>
      </div>

      {showStreak && (
        <div className="streak-bar">
          <div className="streak-flame-block">
            <span className="streak-flame">🔥</span>
            <div className="streak-flame-text">
              <span className="streak-count">{currentStreak}</span>
              <span className="streak-label">day streak</span>
            </div>
          </div>

          <div className="streak-xp-block">
            <div className="streak-level-badge">Lv. {level}</div>
            <div className="streak-xp-wrap">
              <div className="streak-xp-bar-track">
                <div
                  className="streak-xp-bar-fill"
                  style={{ width: `${xpProgress * 100}%` }}
                />
              </div>
              <span className="streak-xp-label">{xpInLevel} / 200 XP</span>
            </div>
          </div>

          <div className="streak-longest-block">
            <span className="streak-longest-value">{longestStreak}</span>
            <span className="streak-longest-label">best streak</span>
          </div>
        </div>
      )}

      <div className="home-stats-row">
        <div className="home-stat-card">
          <div className="home-stat-number">{dueCount}</div>
          <div className="home-stat-label">Due today</div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-number">{masteredCount}</div>
          <div className="home-stat-label">Mastered</div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-number">{accuracy !== null ? `${accuracy}%` : '—'}</div>
          <div className="home-stat-label">Accuracy</div>
        </div>
      </div>

      <div className="home-section-title">Quiz mode</div>
      <div className="quiz-mode-toggle">
        <button
          className={`quiz-mode-btn${quizMode === 'classic' ? ' quiz-mode-btn--active' : ''}`}
          onClick={() => onQuizModeChange('classic')}
        >
          Classic
          <span className="quiz-mode-desc">Flag → Name</span>
        </button>
        <button
          className={`quiz-mode-btn${quizMode === 'reverse' ? ' quiz-mode-btn--active' : ''}`}
          onClick={() => onQuizModeChange('reverse')}
        >
          Reverse
          <span className="quiz-mode-desc">Name → Flag</span>
        </button>
        <button
          className={`quiz-mode-btn${quizMode === 'typing' ? ' quiz-mode-btn--active' : ''}`}
          onClick={() => onQuizModeChange('typing')}
        >
          Type It
          <span className="quiz-mode-desc">Free response</span>
        </button>
      </div>

      <div className="home-section-title">Study region</div>
      <RegionFilter selected={selectedRegions} onChange={onRegionsChange} />

      <div className="home-actions">
        <button className="btn-primary" onClick={onStartQuiz} disabled={!canStart}>
          {poolDue > 0 ? `Start Quiz · ${poolDue} due` : 'Start Quiz'}
        </button>
        {canStart && (
          <div className="tricky-drill-wrap">
            <button className="btn-secondary" onClick={onStartTrickyDrill}>
              Drill Tricky Flags
            </button>
            <div className="tricky-drill-hint">Confusable pairs + your hardest flags</div>
          </div>
        )}
        {seenCount > 0 && (
          <button className="btn-danger-ghost" onClick={handleReset}>
            Reset progress
          </button>
        )}
      </div>
    </div>
  );
}
