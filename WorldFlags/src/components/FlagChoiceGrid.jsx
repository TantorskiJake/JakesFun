import { useState, useEffect } from 'react';
import { getFlagUrl } from '../data/countries.js';

export default function FlagChoiceGrid({ choices, onSelect, feedback, disabled }) {
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    setLoaded({});
  }, [choices]);

  return (
    <div className="flag-choice-grid">
      {choices.map((country) => {
        let cls = 'flag-choice-btn';
        let icon = null;

        if (feedback) {
          if (country.code === feedback.correctCode && feedback.selectedCode === country.code) {
            cls += ' flag-choice-btn--correct';
            icon = '✓';
          } else if (country.code === feedback.selectedCode) {
            cls += ' flag-choice-btn--wrong';
            icon = '✗';
          } else if (country.code === feedback.correctCode) {
            cls += ' flag-choice-btn--reveal-correct';
            icon = '✓';
          } else {
            cls += ' flag-choice-btn--dimmed';
          }
        }

        return (
          <button
            key={country.code}
            className={cls}
            onClick={() => !disabled && onSelect(country.code)}
            disabled={disabled}
            aria-label={country.name}
          >
            <div className="flag-choice-img-wrap">
              {!loaded[country.code] && (
                <div className="flag-choice-spinner">
                  <div className="spinner" />
                </div>
              )}
              <img
                key={country.code}
                src={getFlagUrl(country.code)}
                alt={country.name}
                className={`flag-choice-img${loaded[country.code] ? '' : ' flag-choice-img--loading'}`}
                onLoad={() => setLoaded(prev => ({ ...prev, [country.code]: true }))}
                onError={() => setLoaded(prev => ({ ...prev, [country.code]: true }))}
              />
            </div>
            {icon && <span className="flag-choice-result-icon">{icon}</span>}
          </button>
        );
      })}
    </div>
  );
}
