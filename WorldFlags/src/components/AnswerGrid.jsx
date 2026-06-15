const KEYS = ['1', '2', '3', '4'];

export default function AnswerGrid({ choices, onSelect, feedback, disabled, labelKey = 'name' }) {
  return (
    <div className="answer-grid">
      {choices.map((country, i) => {
        let cls = 'answer-btn';
        let icon = null;

        if (feedback) {
          if (country.code === feedback.correctCode && feedback.selectedCode === country.code) {
            cls += ' answer-btn--correct';
            icon = '✓';
          } else if (country.code === feedback.selectedCode) {
            cls += ' answer-btn--wrong';
            icon = '✗';
          } else if (country.code === feedback.correctCode) {
            cls += ' answer-btn--reveal-correct';
            icon = '✓';
          } else {
            cls += ' answer-btn--dimmed';
          }
        }

        return (
          <button
            key={country.code}
            className={cls}
            onClick={() => !disabled && onSelect(country.code)}
            disabled={disabled}
          >
            <span className="answer-key">{KEYS[i]}</span>
            <span>{country[labelKey]}</span>
            {icon && <span className="answer-result-icon">{icon}</span>}
          </button>
        );
      })}
    </div>
  );
}
