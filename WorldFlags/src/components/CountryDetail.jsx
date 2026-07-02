import { useEffect } from 'react';
import { countries, REGIONS, getFlagUrl } from '../data/countries.js';
import { masteryLevel } from '../utils/sm2.js';
import { getConfusableGroup } from '../data/confusables.js';

const MASTERY_LABELS = ['New', 'Learning', 'Familiar', 'Mastered'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDue(dueDate) {
  if (!dueDate) return '—';
  if (dueDate <= todayStr()) return 'Due now';
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// Modal with a country's flag, facts, learning stats, and look-alike flags.
export default function CountryDetail({ code, progress, onClose, onSelect }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const country = countries.find(c => c.code === code);
  if (!country) return null;

  const card = progress[code];
  const level = masteryLevel(card);
  const acc = card && card.totalAnswers > 0
    ? Math.round((card.correctAnswers / card.totalAnswers) * 100)
    : null;
  const regionLabel = REGIONS.find(r => r.id === country.region)?.label ?? country.region;

  const group = getConfusableGroup(code);
  const lookalikes = group
    ? group
        .filter(g => g !== code)
        .map(g => countries.find(c => c.code === g))
        .filter(Boolean)
    : [];

  return (
    <div className="country-detail-overlay" onClick={onClose}>
      <div
        className="country-detail-card"
        role="dialog"
        aria-modal="true"
        aria-label={country.name}
        onClick={e => e.stopPropagation()}
      >
        <button className="country-detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <img
          key={code}
          src={getFlagUrl(code)}
          alt={`Flag of ${country.name}`}
          className="country-detail-flag"
        />
        <h2 className="country-detail-name">{country.name}</h2>
        <p className="country-detail-meta">
          Capital: {country.capital} · {regionLabel}
        </p>

        {card ? (
          <div className="country-detail-stats">
            <div>
              <strong>{acc !== null ? `${acc}%` : '—'}</strong>
              <span>accuracy</span>
            </div>
            <div>
              <strong>{card.totalAnswers}</strong>
              <span>times seen</span>
            </div>
            <div>
              <strong>{MASTERY_LABELS[level]}</strong>
              <span>mastery</span>
            </div>
            <div>
              <strong>{formatDue(card.dueDate)}</strong>
              <span>next review</span>
            </div>
          </div>
        ) : (
          <p className="country-detail-empty">Not studied yet</p>
        )}

        {lookalikes.length > 0 && (
          <div className="country-detail-confusables">
            <div className="country-detail-section-title">Often confused with</div>
            <div className="confusable-thumb-row">
              {lookalikes.map(c => (
                <button
                  key={c.code}
                  className="confusable-thumb"
                  onClick={() => onSelect?.(c.code)}
                  title={`View ${c.name}`}
                >
                  <img src={getFlagUrl(c.code)} alt="" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
