import { countries } from '../data/countries';
import { isDue } from '../utils/sm2';
import { CONFUSABLE_GROUPS } from '../data/confusables';

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

export function buildTrickySession(progress, regions) {
  const pool = regions.includes('all')
    ? countries
    : countries.filter((c) => regions.includes(c.region));

  const poolCodes = new Set(pool.map((c) => c.code));

  // Step 1: collect all confusable group members present in the region pool
  const confusableCodes = CONFUSABLE_GROUPS
    .flat()
    .filter((code) => poolCodes.has(code));
  const confusableSet = new Set(confusableCodes);
  const confusables = shuffle(
    pool.filter((c) => confusableSet.has(c.code))
  );

  // Step 2: countries with accuracy < 60% and at least 3 answers, sorted worst first
  const strugglers = pool
    .filter((c) => {
      const p = progress[c.code];
      return p && p.totalAnswers >= 3 && p.correctAnswers / p.totalAnswers < 0.6;
    })
    .sort((a, b) => {
      const accA = progress[a.code].correctAnswers / progress[a.code].totalAnswers;
      const accB = progress[b.code].correctAnswers / progress[b.code].totalAnswers;
      return accA - accB;
    })
    .filter((c) => !confusableSet.has(c.code)); // deduplicate

  // Step 3: combine, deduplicate, slice
  const combined = [...confusables, ...strugglers].slice(0, SESSION_SIZE);

  // Step 4: fall back if not enough candidates
  if (combined.length < 5) {
    return buildSession(regions, progress);
  }

  return combined;
}

export function getChoices(correct, allCountries, regions) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter((c) => regions.includes(c.region));

  const others = shuffle(pool.filter((c) => c.code !== correct.code));
  const distractors = others.slice(0, 3);
  return shuffle([correct, ...distractors]);
}
