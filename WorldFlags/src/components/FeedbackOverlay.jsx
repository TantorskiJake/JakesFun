import { countries, getFlagUrl } from '../data/countries.js';
import { getConfusableGroup } from '../data/confusables.js';

// True when a wrong answer deserves the side-by-side flag comparison:
// name-based modes only, and the correct flag has known look-alikes.
export function showsComparison(correctCode, selectedCode, labelKey = 'name') {
  return (
    labelKey === 'name' &&
    !!selectedCode &&
    selectedCode !== correctCode &&
    !!getConfusableGroup(correctCode)
  );
}

export default function FeedbackOverlay({ feedback, labelKey = 'name' }) {
  if (!feedback) return null;

  const correctCountry = countries.find(c => c.code === feedback.correctCode);
  const correctAnswer = correctCountry?.[labelKey] ?? correctCountry?.name;
  const sub = labelKey === 'capital'
    ? correctCountry?.name
    : correctCountry?.capital && `Capital: ${correctCountry.capital}`;

  const selectedCountry = !feedback.correct && feedback.selectedCode
    ? countries.find(c => c.code === feedback.selectedCode)
    : null;
  const compare = !feedback.correct
    && selectedCountry
    && showsComparison(feedback.correctCode, feedback.selectedCode, labelKey);

  return (
    <>
      <div className={`feedback-banner feedback-banner--${feedback.correct ? 'correct' : 'wrong'}`}>
        <span className="feedback-banner-icon">{feedback.correct ? '✓' : '✗'}</span>
        <span className="feedback-banner-text">
          <span>
            {feedback.correct
              ? <>Nice. That&rsquo;s {correctAnswer}</>
              : <>Almost. This one is <strong>{correctAnswer}</strong></>}
          </span>
          {sub && <span className="feedback-banner-sub">{sub}</span>}
        </span>
        <span className="feedback-banner-continue" aria-hidden="true" />
      </div>

      {compare && (
        <div className="flag-compare">
          <div className="flag-compare-item flag-compare-item--correct">
            <img
              src={getFlagUrl(correctCountry.code)}
              alt={`Flag of ${correctCountry.name}`}
              className="flag-compare-img"
            />
            <span className="flag-compare-label">✓ {correctCountry.name}</span>
          </div>
          <div className="flag-compare-item flag-compare-item--wrong">
            <img
              src={getFlagUrl(selectedCountry.code)}
              alt={`Flag of ${selectedCountry.name}`}
              className="flag-compare-img"
            />
            <span className="flag-compare-label">✗ {selectedCountry.name} — your pick</span>
          </div>
        </div>
      )}
    </>
  );
}
