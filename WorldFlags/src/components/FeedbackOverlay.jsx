import { countries } from '../data/countries.js';

export default function FeedbackOverlay({ feedback }) {
  if (!feedback) return null;

  const correctCountry = countries.find(c => c.code === feedback.correctCode);

  if (feedback.correct) {
    return (
      <div className="feedback-banner feedback-banner--correct">
        <span className="feedback-banner-icon">✓</span>
        <span>Correct! That&rsquo;s {correctCountry?.name}</span>
      </div>
    );
  }

  return (
    <div className="feedback-banner feedback-banner--wrong">
      <span className="feedback-banner-icon">✗</span>
      <span>
        Wrong &mdash; it was <strong>{correctCountry?.name}</strong>
      </span>
    </div>
  );
}
