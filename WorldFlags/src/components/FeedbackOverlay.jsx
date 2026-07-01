import { countries } from '../data/countries.js';

export default function FeedbackOverlay({ feedback, labelKey = 'name' }) {
  if (!feedback) return null;

  const correctCountry = countries.find(c => c.code === feedback.correctCode);
  const correctAnswer = correctCountry?.[labelKey] ?? correctCountry?.name;
  const sub = labelKey === 'capital'
    ? correctCountry?.name
    : correctCountry?.capital && `Capital: ${correctCountry.capital}`;

  return (
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
  );
}
