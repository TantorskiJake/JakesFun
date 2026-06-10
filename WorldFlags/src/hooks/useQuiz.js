import { countries } from '../data/countries';
import { isDue } from '../utils/sm2';

const SESSION_SIZE = 20;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSession(regions, progress) {
  const pool = regions.includes('all')
    ? countries
    : countries.filter((c) => regions.includes(c.region));

  const due = pool.filter((c) => isDue(progress[c.code]));
  const unseen = pool.filter((c) => !progress[c.code]);
  const seen = pool.filter(
    (c) => progress[c.code] && !isDue(progress[c.code])
  );

  // Priority: due > unseen > not-yet-due (as overflow)
  let session = shuffle(due);
  if (session.length < SESSION_SIZE) {
    session = [...session, ...shuffle(unseen)].slice(0, SESSION_SIZE);
  }
  if (session.length < SESSION_SIZE) {
    session = [...session, ...shuffle(seen)].slice(0, SESSION_SIZE);
  }

  return session.slice(0, SESSION_SIZE);
}

export function getChoices(correct, allCountries, regions) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter((c) => regions.includes(c.region));

  const others = shuffle(pool.filter((c) => c.code !== correct.code));
  const distractors = others.slice(0, 3);
  return shuffle([correct, ...distractors]);
}

export function getCapitalChoices(correct, allCountries, regions) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter((c) => regions.includes(c.region));

  const others = shuffle(pool.filter((c) => c.code !== correct.code));
  const distractors = others.slice(0, 3);
  return shuffle([correct, ...distractors]);
}
