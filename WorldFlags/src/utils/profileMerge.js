const EMPTY_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalXP: 0,
  level: 1,
};

function scoreCard(card) {
  if (!card) return -1;
  return Number(card.totalAnswers || 0);
}

export function mergeProgress(localProgress = {}, cloudProgress = {}) {
  const merged = { ...cloudProgress };
  const codes = new Set([
    ...Object.keys(localProgress || {}),
    ...Object.keys(cloudProgress || {}),
  ]);

  codes.forEach((code) => {
    const localCard = localProgress?.[code];
    const cloudCard = cloudProgress?.[code];
    merged[code] = scoreCard(localCard) >= scoreCard(cloudCard)
      ? localCard
      : cloudCard;
  });

  return merged;
}

export function mergeStreak(localStreak = {}, cloudStreak = {}) {
  const local = { ...EMPTY_STREAK, ...(localStreak || {}) };
  const cloud = { ...EMPTY_STREAK, ...(cloudStreak || {}) };
  const newerPracticeDate =
    !cloud.lastPracticeDate || local.lastPracticeDate > cloud.lastPracticeDate
      ? local.lastPracticeDate
      : cloud.lastPracticeDate;

  return {
    currentStreak: Math.max(local.currentStreak || 0, cloud.currentStreak || 0),
    longestStreak: Math.max(local.longestStreak || 0, cloud.longestStreak || 0),
    lastPracticeDate: newerPracticeDate,
    totalXP: Math.max(local.totalXP || 0, cloud.totalXP || 0),
    level: Math.max(local.level || 1, cloud.level || 1),
  };
}
