import { getFlagUrl } from '../data/countries.js';

const KEYS = ['1', '2', '3', '4'];

export default function FlagAnswerGrid({ choices, onSelect, feedback, disabled }) {
  return (
    <div className="flag-answer-grid">
      {choices.map((country, i) => {
        let cls = 'flag-answer-btn';
        let icon = null;

        if (feedback) {
          const isCorrect = country.code === feedback.correctCode;
          const isSelected = country.code === feedback.selectedCode;

          if (isSelected && isCorrect) {
            cls += ' flag-answer-btn--correct';
            icon = '✓';
          } else if (isSelected) {
            cls += ' flag-answer-btn--wrong';
            icon = '✗';
          } else if (isCorrect) {
            cls += ' flag-answer-btn--reveal';
            icon = '✓';
          } else {
            cls += ' flag-answer-btn--dimmed';
          }
        }

        return (
          <button
            key={country.code}
            className={cls}
            onClick={() => !disabled && onSelect(country.code)}
            disabled={disabled}
            aria-label={feedback ? country.name : `Choice ${KEYS[i]}`}
          >
            <div className="flag-answer-img-wrap">
              <img
                src={getFlagUrl(country.code)}
                alt={feedback ? country.name : ''}
                className="flag-answer-img"
              />
              {icon && <div className="flag-answer-result">{icon}</div>}
            </div>
            <div className="flag-answer-footer">
              <span className="flag-answer-key">{KEYS[i]}</span>
              {feedback && <span className="flag-answer-name">{country.name}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
