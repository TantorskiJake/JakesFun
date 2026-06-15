import { useState } from 'react';
import { countries, REGIONS, getFlagUrl } from '../data/countries.js';
import { masteryLevel } from '../utils/sm2.js';
import { BADGES } from '../data/badges.js';
import ProfilePanel from './ProfilePanel.jsx';

const MASTERY_LABELS = ['New', 'Learning', 'Familiar', 'Mastered'];
const MASTERY_COLORS = ['var(--text-muted)', 'var(--warning)', 'var(--primary)', 'var(--success)'];

export default function StatsView({ progress, earnedBadges, streak, profile }) {
  const [search, setSearch] = useState('');

  const totalAnswers = Object.values(progress).reduce((s, c) => s + c.totalAnswers, 0);
  const totalCorrect = Object.values(progress).reduce((s, c) => s + c.correctAnswers, 0);
  const overallAccuracy = totalAnswers === 0 ? null : Math.round((totalCorrect / totalAnswers) * 100);

  const masteryCounts = [0, 1, 2, 3].map(level =>
    countries.filter(c => masteryLevel(progress[c.code]) === level).length
  );

  const regionStats = REGIONS.filter(r => r.id !== 'all').map(r => {
    const pool = countries.filter(c => c.region === r.id);
    const counts = [0, 1, 2, 3].map(level =>
      pool.filter(c => masteryLevel(progress[c.code]) === level).length
    );
    const mastered = counts[3];
    return { ...r, pool, counts, mastered, total: pool.length };
  });

  const filtered = countries
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .map(c => {
      const card = progress[c.code];
      const level = masteryLevel(card);
      const acc = card && card.totalAnswers > 0
        ? Math.round((card.correctAnswers / card.totalAnswers) * 100)
        : null;
      return { ...c, card, level, acc };
    });
  const earnedCount = BADGES.filter(b => earnedBadges.includes(b.id)).length;
  const currentStreak = streak?.currentStreak ?? 0;

  return (
    <div className="stats-view">
      <div className="progress-hero">
        <div>
          <span className="home-kicker">Progress</span>
          <h1>Your world at a glance</h1>
          <p>Track mastery, rewards, and the flags that need another pass.</p>
        </div>
        <div className="progress-hero-score">
          <span>{masteryCounts[3]}</span>
          <small>mastered</small>
        </div>
      </div>

      <div className="stats-section">
        <h2>Overview</h2>
        <div className="stats-overview-grid">
          <div className="stat-card">
            <div className="stat-card-value">
              {overallAccuracy !== null ? `${overallAccuracy}%` : '—'}
            </div>
            <div className="stat-card-label">Overall accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{totalAnswers}</div>
            <div className="stat-card-label">Total answers</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{masteryCounts[3]}</div>
            <div className="stat-card-label">Mastered</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{Object.keys(progress).length}</div>
            <div className="stat-card-label">Countries seen</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{currentStreak}</div>
            <div className="stat-card-label">Day streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{earnedCount}</div>
            <div className="stat-card-label">Badges earned</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Mastery Breakdown</h2>
        <div className="mastery-grid">
          {MASTERY_LABELS.map((label, i) => (
            <div className="mastery-card" key={label}>
              <div className="mastery-card-count" style={{ color: MASTERY_COLORS[i] }}>
                {masteryCounts[i]}
              </div>
              <div className="mastery-card-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h2>By Region</h2>
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
        <h2>Country Details</h2>
        <input
          type="text"
          className="table-search"
          placeholder="Search countries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="countries-table-wrap" style={{ marginTop: 16 }}>
          <table className="countries-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Region</th>
                <th>Mastery</th>
                <th>Accuracy</th>
                <th>Answers</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.code}>
                  <td>
                    <div className="country-name-cell">
                      <img
                        src={getFlagUrl(c.code)}
                        alt=""
                        className="country-flag-thumb"
                      />
                      {c.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {c.region}
                  </td>
                  <td>
                    <span className={`mastery-badge mastery-badge-${c.level}`}>
                      {MASTERY_LABELS[c.level]}
                    </span>
                  </td>
                  <td className="accuracy-cell" style={{ color: MASTERY_COLORS[c.level] }}>
                    {c.acc !== null ? `${c.acc}%` : '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {c.card ? c.card.totalAnswers : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-section">
        <h2>Account</h2>
        <ProfilePanel profile={profile} />
      </div>
    </div>
  );
}
