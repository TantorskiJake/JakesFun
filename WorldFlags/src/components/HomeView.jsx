import { REGIONS, countries } from '../data/countries.js';
import { isDue, masteryLevel } from '../utils/sm2.js';
import ProfilePanel from './ProfilePanel.jsx';
import RegionFilter from './RegionFilter.jsx';

const REGION_CODES = {
  all: 'ALL',
  europe: 'EUR',
  africa: 'AFR',
  asia: 'ASI',
  americas: 'AME',
  oceania: 'OCE',
};

const MODES = [
  { id: 'classic',     label: 'Flag',        desc: 'Flag → Name' },
  { id: 'reverse',     label: 'Match',       desc: 'Name → Flag' },
  { id: 'typing',      label: 'Type',        desc: 'Free response' },
  { id: 'capitals',    label: 'Capitals',    desc: 'Flag → Capital' },
  { id: 'confusables', label: 'Confusables', desc: 'Drill look-alike flags' },
];

const SESSION_SIZES = [10, 20, 30];

export default function HomeView({
  dueCount,
  masteredCount,
  totalCount,
  sessionSize,
  onSessionSizeChange,
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

  const { currentStreak, longestStreak, totalXP, level } = streak ?? {};
  const showStreak = totalXP > 0;
  const xpInLevel = totalXP % 200;
  const xpProgress = xpInLevel / 200;

  const heroKicker = poolDue > 0 ? `${poolDue} flag${poolDue === 1 ? '' : 's'} due for review` : "Today's lesson";

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
      code: REGION_CODES[region.id] ?? region.label.slice(0, 3).toUpperCase(),
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
            <span className="home-kicker">{heroKicker}</span>
            <h1>Build your world map</h1>
            <p>{regionLabel} · {pool.length} flags</p>
            <div className="lesson-hero-actions">
              <button className="btn-primary btn-continue" onClick={onStartQuiz} disabled={!canStart}>
                {poolDue > 0 ? `Continue · ${poolDue} due` : 'Start lesson'}
              </button>
              {canStart && (
                <button className="btn-secondary" onClick={onStartTrickyDrill}>
                  Tricky drill
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

        <div>
          <div className="home-section-title">Lesson type</div>
          <div className="quiz-mode-toggle">
            {MODES.map(mode => (
              <button
                key={mode.id}
                className={`quiz-mode-btn${quizMode === mode.id ? ' quiz-mode-btn--active' : ''}`}
                onClick={() => onQuizModeChange(mode.id)}
              >
                {mode.label}
                <span className="quiz-mode-desc">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {onSessionSizeChange && (
          <div>
            <div className="home-section-title">Questions per session</div>
            <div className="size-selector">
              {SESSION_SIZES.map(s => (
                <button
                  key={s}
                  className={`size-btn${sessionSize === s ? ' size-btn--active' : ''}`}
                  onClick={() => onSessionSizeChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {showStreak && (
          <div className="streak-bar">
            <div className="streak-flame-block">
              <span className="streak-flame">ST</span>
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
            <div className="home-stat-icon">REV</div>
            <div className="home-stat-label">Due for review</div>
            <div className="home-stat-number" style={dueCount > 0 ? { color: 'var(--warning)' } : undefined}>{dueCount}</div>
            <div className="home-stat-subtle">{poolDue > 0 ? `${poolDue} in selection` : 'All caught up'}</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon">MAS</div>
            <div className="home-stat-label">Flags mastered</div>
            <div className="home-stat-number">{masteredCount}</div>
            <div className="home-stat-subtle">of {totalCount} flags</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon">ACC</div>
            <div className="home-stat-label">Recall rate</div>
            <div className="home-stat-number">{accuracy !== null ? `${accuracy}%` : '—'}</div>
            <div className="home-stat-subtle">{totalAnswers > 0 ? `${totalAnswers} answers` : 'No answers yet'}</div>
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
                <span className="path-track-icon">{track.code}</span>
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
            <div className="home-section-title">Custom course mix</div>
            <RegionFilter selected={selectedRegions} onChange={onRegionsChange} />
          </div>

          {seenCount > 0 && (
            <div className="home-actions">
              <button className="btn-danger-ghost" onClick={handleReset}>
                Reset progress
              </button>
            </div>
          )}
        </div>
      </section>

      <ProfilePanel profile={profile} />
    </div>
  );
}
