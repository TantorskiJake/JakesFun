import { countries } from './countries.js';
import { masteryLevel } from '../utils/sm2.js';

export const BADGES = [
  { id: 'first_answer',   icon: '🌱', label: 'First Steps',      desc: 'Answer your first flag' },
  { id: 'mastered_10',    icon: '⭐', label: 'Rising Star',       desc: 'Master 10 flags' },
  { id: 'mastered_50',    icon: '🌟', label: 'Globetrotter',      desc: 'Master 50 flags' },
  { id: 'mastered_100',   icon: '🗺️', label: 'World Traveler',   desc: 'Master 100 flags' },
  { id: 'mastered_all',   icon: '🏆', label: 'World Master',      desc: 'Master all 197 flags' },
  { id: 'perfect_session',icon: '💯', label: 'Perfectionist',     desc: '100% on a session of 10+' },
  { id: 'streak_3',       icon: '🔥', label: 'On Fire',           desc: '3-day study streak' },
  { id: 'streak_7',       icon: '🔥', label: 'Week Warrior',      desc: '7-day study streak' },
  { id: 'streak_30',      icon: '🔥', label: 'Dedicated',         desc: '30-day study streak' },
  { id: 'africa_done',    icon: '🌍', label: 'Africa Expert',     desc: 'Master all African flags' },
  { id: 'europe_done',    icon: '🏰', label: 'Europe Expert',     desc: 'Master all European flags' },
  { id: 'americas_done',  icon: '🗽', label: 'Americas Expert',   desc: 'Master all Americas flags' },
  { id: 'asia_done',      icon: '🏯', label: 'Asia Expert',       desc: 'Master all Asian flags' },
  { id: 'oceania_done',   icon: '🏝️', label: 'Pacific Expert',   desc: 'Master all Oceania flags' },
];

export function checkBadges(progress, streak, sessionResults, alreadyEarned) {
  const masteredCount = countries.filter(c => masteryLevel(progress[c.code]) === 3).length;
  const totalAnswers = Object.values(progress).reduce((s, c) => s + c.totalAnswers, 0);
  const regionDone = (region) =>
    countries.filter(c => c.region === region).every(c => masteryLevel(progress[c.code]) === 3);
  const isPerfect =
    sessionResults && sessionResults.length >= 10 && sessionResults.every(r => r.correct);

  const met = {
    first_answer:    totalAnswers >= 1,
    mastered_10:     masteredCount >= 10,
    mastered_50:     masteredCount >= 50,
    mastered_100:    masteredCount >= 100,
    mastered_all:    masteredCount >= countries.length,
    perfect_session: isPerfect,
    streak_3:        streak >= 3,
    streak_7:        streak >= 7,
    streak_30:       streak >= 30,
    africa_done:     regionDone('africa'),
    europe_done:     regionDone('europe'),
    americas_done:   regionDone('americas'),
    asia_done:       regionDone('asia'),
    oceania_done:    regionDone('oceania'),
  };

  return BADGES.filter(b => met[b.id] && !alreadyEarned.includes(b.id));
}
