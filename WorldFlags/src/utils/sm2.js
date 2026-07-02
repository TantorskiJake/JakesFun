import { localDateStr } from './dates.js';

function todayStr() {
  return localDateStr();
}

export function getInitialCard() {
  return {
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    dueDate: todayStr(),
    totalAnswers: 0,
    correctAnswers: 0,
  };
}

export function updateCard(card, correct) {
  const quality = correct ? 4 : 1;
  let { repetitions, interval, easeFactor } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    ...card,
    repetitions,
    interval,
    easeFactor,
    dueDate: localDateStr(due),
    totalAnswers: card.totalAnswers + 1,
    correctAnswers: card.correctAnswers + (correct ? 1 : 0),
  };
}

export function isDue(card) {
  return !card || !card.dueDate || card.dueDate <= todayStr();
}

export function masteryLevel(card) {
  if (!card || card.repetitions === 0) return 0;
  if (card.repetitions < 3) return 1;
  if (card.repetitions < 6) return 2;
  return 3;
}
