const EMPTY_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalXP: 0,
  level: 1,
  freezes: 0,
  freezesEarned: 0,
  weeklyXP: 0,
  weekStart: null,
};

const MAX_FREEZES = 2;

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
  const localIsNewer =
    !cloud.lastPracticeDate || local.lastPracticeDate > cloud.lastPracticeDate;
  const newerPracticeDate = localIsNewer
    ? local.lastPracticeDate
    : cloud.lastPracticeDate;

  // Freezes follow the device that practiced most recently, since it applied
  // the latest earn/spend; max-wins would resurrect spent freezes.
  const freezes = Math.min(
    MAX_FREEZES,
    Math.max(0, (localIsNewer ? local.freezes : cloud.freezes) || 0)
  );

  // Weekly XP: same bucket → max-wins like totalXP; otherwise the newer
  // week's bucket replaces the stale one.
  let weekStart;
  let weeklyXP;
  if ((local.weekStart || '') === (cloud.weekStart || '')) {
    weekStart = local.weekStart || cloud.weekStart || null;
    weeklyXP = Math.max(local.weeklyXP || 0, cloud.weeklyXP || 0);
  } else if ((local.weekStart || '') > (cloud.weekStart || '')) {
    weekStart = local.weekStart;
    weeklyXP = local.weeklyXP || 0;
  } else {
    weekStart = cloud.weekStart;
    weeklyXP = cloud.weeklyXP || 0;
  }

  return {
    currentStreak: Math.max(local.currentStreak || 0, cloud.currentStreak || 0),
    longestStreak: Math.max(local.longestStreak || 0, cloud.longestStreak || 0),
    lastPracticeDate: newerPracticeDate,
    totalXP: Math.max(local.totalXP || 0, cloud.totalXP || 0),
    level: Math.max(local.level || 1, cloud.level || 1),
    freezes,
    freezesEarned: Math.max(local.freezesEarned || 0, cloud.freezesEarned || 0),
    weeklyXP,
    weekStart,
  };
}
