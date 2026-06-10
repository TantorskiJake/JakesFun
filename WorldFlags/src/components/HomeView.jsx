import { REGIONS, countries } from '../data/countries.js';
import { isDue, masteryLevel } from '../utils/sm2.js';
import ProfilePanel from './ProfilePanel.jsx';
import RegionFilter from './RegionFilter.jsx';

const REGION_ICONS = {
  all: '🌎',
  europe: '🏰',
  africa: '⛰️',
  asia: '🏯',
  americas: '🗽',
  oceania: '🏝️',
};

const MODE_LABELS = {
  classic: 'Flag lesson',
  reverse: 'Find the flag',
  typing: 'Type it out',
  capitals: 'Capital practice',
};

export default function HomeView({
  dueCount,
  masteredCount,
  totalCount,
  selectedRegions,
  onRegionsChange,
  quizMode,
  onQuizModeChange,
  onStartQuiz,
  onStartTrickyDrill,
  onResetProgress,
  progress,
  streak,
  profile,
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
  const masteredPercent = totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100);
  const regionLabel = selectedRegions.includes('all')
    ? 'World course'
    : selectedRegions
      .map(id => REGIONS.find(region => region.id === id)?.label)
      .filter(Boolean)
      .join(', ');
  const activeModeLabel = MODE_LABELS[quizMode] ?? 'Flag lesson';

  const { currentStreak, longestStreak, totalXP, level } = streak ?? {};
  const showStreak = totalXP > 0;
  const xpInLevel = totalXP % 200;
  const xpProgress = xpInLevel / 200;

  const regionTracks = REGIONS.map(region => {
    const regionPool = region.id === 'all'
      ? countries
      : countries.filter(c => c.region === region.id);
    const learned = regionPool.filter(c => masteryLevel(progress[c.code]) >= 2).length;
    const due = regionPool.filter(c => isDue(progress[c.code])).length;
    const percent = regionPool.length === 0 ? 0 : Math.round((learned / regionPool.length) * 100);
    const active = selectedRegions.includes(region.id);

    return {
      ...region,
      icon: REGION_ICONS[region.id] ?? '📍',
      learned,
      due,
      percent,
      active,
    };
  });

  return (
    <div className="home-view">
      <section className="study-dashboard">
        <div className="lesson-hero">
          <div className="lesson-hero-copy">
            <span className="home-kicker">Today&apos;s lesson</span>
            <h1>Build your world map</h1>
            <p>{regionLabel} · {pool.length} flags · {activeModeLabel}</p>
            <div className="lesson-hero-actions">
              <button className="btn-primary btn-continue" onClick={onStartQuiz} disabled={!canStart}>
                {poolDue > 0 ? `Continue · ${poolDue} due` : 'Start lesson'}
              </button>
              {canStart && (
                <button className="btn-secondary" onClick={onStartTrickyDrill}>
                  Practice mistakes
                </button>
              )}
            </div>
          </div>
          <div className="mastery-ring" aria-label={`${masteredPercent}% mastered`}>
            <div className="mastery-ring-track">
              <div
                className="mastery-ring-fill"
                style={{ '--mastery-progress': `${masteredPercent * 3.6}deg` }}
              />
              <div className="mastery-ring-center">
                <span>{masteredPercent}%</span>
                <small>mastered</small>
              </div>
            </div>
          </div>
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
            <div className="home-stat-label">Ready to review</div>
            <div className="home-stat-number">{dueCount}</div>
            <div className="home-stat-subtle">{poolDue} in selection</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-label">Flags mastered</div>
            <div className="home-stat-number">{masteredCount}</div>
            <div className="home-stat-subtle">of {totalCount} flags</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-label">Recall rate</div>
            <div className="home-stat-number">{accuracy !== null ? `${accuracy}%` : '—'}</div>
            <div className="home-stat-subtle">{totalAnswers} answers</div>
          </div>
        </div>

        <div className="learning-path">
          <div className="learning-path-header">
            <div>
              <div className="home-section-title">Learning path</div>
              <p>Pick a course, then continue with reviews, mistakes, and new flags.</p>
            </div>
          </div>
          <div className="path-track-list">
            {regionTracks.map(track => (
              <button
                key={track.id}
                className={`path-track-card${track.active ? ' path-track-card--active' : ''}`}
                onClick={() => onRegionsChange([track.id])}
              >
                <span className="path-track-icon">{track.icon}</span>
                <span className="path-track-content">
                  <span className="path-track-name">{track.label}</span>
                  <span className="path-track-meta">
                    {track.learned} learned · {track.due} to review
                  </span>
                  <span className="path-track-progress">
                    <span style={{ width: `${track.percent}%` }} />
                  </span>
                </span>
                <span className="path-track-percent">{track.percent}%</span>
              </button>
            ))}
          </div>
        </div>

        <div className="study-controls">
          <div className="study-control-section">
            <div className="home-section-title">Lesson type</div>
            <div className="quiz-mode-toggle">
              <button
                className={`quiz-mode-btn${quizMode === 'classic' ? ' quiz-mode-btn--active' : ''}`}
                onClick={() => onQuizModeChange('classic')}
              >
                Flag
                <span className="quiz-mode-desc">Flag → Name</span>
              </button>
              <button
                className={`quiz-mode-btn${quizMode === 'reverse' ? ' quiz-mode-btn--active' : ''}`}
                onClick={() => onQuizModeChange('reverse')}
              >
                Match
                <span className="quiz-mode-desc">Name → Flag</span>
              </button>
              <button
                className={`quiz-mode-btn${quizMode === 'typing' ? ' quiz-mode-btn--active' : ''}`}
                onClick={() => onQuizModeChange('typing')}
              >
                Type
                <span className="quiz-mode-desc">Free response</span>
              </button>
              <button
                className={`quiz-mode-btn${quizMode === 'capitals' ? ' quiz-mode-btn--active' : ''}`}
                onClick={() => onQuizModeChange('capitals')}
              >
                Capitals
                <span className="quiz-mode-desc">Flag → Capital</span>
              </button>
            </div>
          </div>

          <div className="study-control-section">
            <div className="home-section-title">Custom course mix</div>
            <RegionFilter selected={selectedRegions} onChange={onRegionsChange} />
          </div>

          <div className="home-actions">
            {seenCount > 0 && (
              <button className="btn-danger-ghost" onClick={handleReset}>
                Reset progress
              </button>
            )}
          </div>
        </div>
      </section>

      <ProfilePanel profile={profile} />
    </div>
  );
}
