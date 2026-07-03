import { useState } from 'react';
import { countries, REGIONS, getFlagUrl } from '../data/countries.js';
import { masteryLevel, isDue } from '../utils/sm2.js';
import { BADGES } from '../data/badges.js';
import CountryDetail from './CountryDetail.jsx';
import Leaderboard from './Leaderboard.jsx';

const MASTERY_LABELS = ['New', 'Learning', 'Familiar', 'Mastered'];
const MASTERY_COLORS = ['var(--text-muted)', 'var(--warning)', 'var(--primary)', 'var(--success)'];
const MASTERY_BAR_COLORS = ['var(--surface2)', 'var(--warning)', 'var(--primary)', 'var(--success)'];

// How many rows of the full country list to show before "Show all"
const LIST_PREVIEW = 30;

export default function StatsView({ progress, earnedBadges, streak, profile }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [detailCode, setDetailCode] = useState(null);

  const totalAnswers = Object.values(progress).reduce((s, c) => s + c.totalAnswers, 0);
  const totalCorrect = Object.values(progress).reduce((s, c) => s + c.correctAnswers, 0);
  const overallAccuracy = totalAnswers === 0 ? null : Math.round((totalCorrect / totalAnswers) * 100);
  const seenCount = Object.keys(progress).length;

  const masteryCounts = [0, 1, 2, 3].map(level =>
    countries.filter(c => masteryLevel(progress[c.code]) === level).length
  );

  const withStats = countries.map(c => {
    const card = progress[c.code];
    const level = masteryLevel(card);
    const acc = card && card.totalAnswers > 0
      ? Math.round((card.correctAnswers / card.totalAnswers) * 100)
      : null;
    return { ...c, card, level, acc };
  });

  // Most actionable info on the page: flags that keep slipping away.
  // Answered at least twice and either weak accuracy or lapsed back to level 0.
  const trouble = withStats
    .filter(c => c.card && c.card.totalAnswers >= 2 && (c.acc < 75 || c.level === 0))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 8);

  const dueSeen = withStats.filter(c => c.card && isDue(c.card)).length;

  const regionStats = REGIONS.filter(r => r.id !== 'all').map(r => {
    const pool = countries.filter(c => c.region === r.id);
    const counts = [0, 1, 2, 3].map(level =>
      pool.filter(c => masteryLevel(progress[c.code]) === level).length
    );
    return { ...r, counts, total: pool.length };
  });

  // Weakest-first reference list: answered countries by accuracy ascending,
  // then the unseen rest alphabetically.
  const sorted = [...withStats].sort((a, b) => {
    if (a.acc === null && b.acc === null) return a.name.localeCompare(b.name);
    if (a.acc === null) return 1;
    if (b.acc === null) return -1;
    return a.acc - b.acc;
  });
  const filtered = sorted.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const visible = search || showAll ? filtered : filtered.slice(0, LIST_PREVIEW);

  const earnedCount = BADGES.filter(b => earnedBadges.includes(b.id)).length;
  const currentStreak = streak?.currentStreak ?? 0;
  const level = streak?.level ?? 1;
  const totalXP = streak?.totalXP ?? 0;

  return (
    <div className="stats-view">
      <div className="progress-hero">
        <div>
          <span className="home-kicker">Progress</span>
          <h1>Your world at a glance</h1>
          <p>{seenCount} of {countries.length} flags seen · {totalAnswers} answers so far</p>
        </div>
        <div className="progress-hero-score">
          <span>{masteryCounts[3]}</span>
          <small>mastered</small>
        </div>
      </div>

      <div className="stats-overview-grid">
        <div className="stat-card">
          <div className="stat-card-value">{currentStreak}</div>
          <div className="stat-card-label">Day streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">
            {overallAccuracy !== null ? `${overallAccuracy}%` : '—'}
          </div>
          <div className="stat-card-label">Overall accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{level}</div>
          <div className="stat-card-label">Level · {totalXP} XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{earnedCount}</div>
          <div className="stat-card-label">Badges earned</div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Needs attention</h2>
        {dueSeen > 0 && (
          <p className="stats-section-note">
            {dueSeen} flag{dueSeen === 1 ? '' : 's'} due for review — head to Study to clear them.
          </p>
        )}
        {trouble.length > 0 ? (
          <div className="trouble-grid">
            {trouble.map(c => (
              <button key={c.code} className="trouble-chip" onClick={() => setDetailCode(c.code)}>
                <img src={getFlagUrl(c.code)} alt="" />
                <span className="trouble-chip-name">{c.name}</span>
                <span className="trouble-chip-acc">{c.acc}%</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="stats-section-note">
            {totalAnswers === 0
              ? 'Finish a session and your weak spots will show up here.'
              : 'No trouble flags right now — nice recall.'}
          </p>
        )}
      </div>

      <div className="stats-section">
        <h2>Mastery</h2>
        <div className="mastery-bar" role="img" aria-label={
          MASTERY_LABELS.map((label, i) => `${masteryCounts[i]} ${label.toLowerCase()}`).join(', ')
        }>
          {[3, 2, 1, 0].map(i => (
            <span
              key={i}
              style={{
                width: `${(masteryCounts[i] / countries.length) * 100}%`,
                background: MASTERY_BAR_COLORS[i],
              }}
            />
          ))}
        </div>
        <div className="mastery-legend">
          {[3, 2, 1, 0].map(i => (
            <span className="mastery-legend-item" key={i}>
              <span className="mastery-legend-dot" style={{ background: MASTERY_BAR_COLORS[i] }} />
              {masteryCounts[i]} {MASTERY_LABELS[i]}
            </span>
          ))}
        </div>
        <div className="region-breakdown">
          {regionStats.map(r => {
            const masteredPct = (r.counts[3] / r.total) * 100;
            const familiarPct = (r.counts[2] / r.total) * 100;
            const learningPct = (r.counts[1] / r.total) * 100;
            return (
              <div className="region-row" key={r.id}>
                <div className="region-row-header">
                  <span className="region-row-name">{r.label}</span>
                  <span className="region-row-counts">
                    {r.counts[3]} / {r.total} mastered
                  </span>
                </div>
                <div className="region-mastery-bar">
                  <div
                    className="region-mastery-segment segment-mastered"
                    style={{ width: `${masteredPct}%` }}
                  />
                  <div
                    className="region-mastery-segment segment-familiar"
                    style={{ width: `${familiarPct}%` }}
                  />
                  <div
                    className="region-mastery-segment segment-learning"
                    style={{ width: `${learningPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Leaderboard user={profile?.user} />

      <div className="stats-section">
        <h2>Badges</h2>
        <div className="badges-grid">
          {BADGES.map(b => {
            const earned = earnedBadges.includes(b.id);
            return (
              <div key={b.id} className={`badge-item${earned ? ' badge-item--earned' : ''}`} title={b.desc}>
                <span className="badge-item-icon" style={{ opacity: earned ? 1 : 0.25 }}>{b.icon}</span>
                <span className="badge-item-label">{b.label}</span>
                {earned && <span className="badge-item-check">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="stats-section">
        <h2>All countries</h2>
        <p className="stats-section-note">Weakest first — tap any country for details.</p>
        <input
          type="text"
          className="table-search"
          placeholder="Search countries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="country-list">
          {visible.map(c => (
            <button key={c.code} className="country-list-row" onClick={() => setDetailCode(c.code)}>
              <img src={getFlagUrl(c.code)} alt="" className="country-flag-thumb" />
              <span className="country-list-name">
                {c.name}
                <small>
                  <span className="country-list-region">{c.region}</span>
                  {' · '}
                  {c.card ? `${c.card.totalAnswers} answers` : 'not seen yet'}
                </small>
              </span>
              <span className={`mastery-badge mastery-badge-${c.level}`}>
                {MASTERY_LABELS[c.level]}
              </span>
              <span className="country-list-acc" style={{ color: MASTERY_COLORS[c.level] }}>
                {c.acc !== null ? `${c.acc}%` : '—'}
              </span>
            </button>
          ))}
        </div>
        {!search && !showAll && filtered.length > LIST_PREVIEW && (
          <button className="btn-secondary country-list-more" onClick={() => setShowAll(true)}>
            Show all {filtered.length} countries
          </button>
        )}
      </div>

      {detailCode && (
        <CountryDetail
          code={detailCode}
          progress={progress}
          onClose={() => setDetailCode(null)}
          onSelect={setDetailCode}
        />
      )}
    </div>
  );
}
