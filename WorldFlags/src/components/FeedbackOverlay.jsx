import { countries } from '../data/countries.js';

export default function FeedbackOverlay({ feedback, labelKey = 'name' }) {
  if (!feedback) return null;

  const correctCountry = countries.find(c => c.code === feedback.correctCode);
  const correctAnswer = correctCountry?.[labelKey] ?? correctCountry?.name;

  if (feedback.correct) {
    return (
      <div className="feedback-banner feedback-banner--correct">
        <span className="feedback-banner-icon">✓</span>
        <span>Correct! That&rsquo;s {correctAnswer}</span>
      </div>
    );
  }

  return (
    <div className="feedback-banner feedback-banner--wrong">
      <span className="feedback-banner-icon">✗</span>
      <span>
        Wrong &mdash; it was <strong>{correctAnswer}</strong>
      </span>
    </div>
  );
}
