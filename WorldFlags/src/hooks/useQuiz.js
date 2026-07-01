import { countries } from '../data/countries';
import { isDue } from '../utils/sm2';
import { CONFUSABLE_GROUPS, confusableCodes, getConfusableGroup } from '../data/confusables';

const SESSION_SIZE = 20;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSession(regions, progress, sessionSize = SESSION_SIZE, confusablesMode = false) {
  let pool = regions.includes('all')
    ? countries
    : countries.filter(c => regions.includes(c.region));

  if (confusablesMode) {
    pool = pool.filter(c => confusableCodes.has(c.code));
  }

  const due = pool.filter(c => isDue(progress[c.code]));
  const unseen = pool.filter(c => !progress[c.code]);
  const seen = pool.filter(c => progress[c.code] && !isDue(progress[c.code]));

  let session = shuffle(due);
  if (session.length < sessionSize) {
    session = [...session, ...shuffle(unseen)].slice(0, sessionSize);
  }
  if (session.length < sessionSize) {
    session = [...session, ...shuffle(seen)].slice(0, sessionSize);
  }

  return session.slice(0, sessionSize);
}

export function buildTrickySession(progress, regions) {
  const pool = regions.includes('all')
    ? countries
    : countries.filter(c => regions.includes(c.region));

  const poolCodes = new Set(pool.map(c => c.code));

  const confusableSet = new Set(
    CONFUSABLE_GROUPS.flat().filter(code => poolCodes.has(code))
  );
  const confusables = shuffle(pool.filter(c => confusableSet.has(c.code)));

  const strugglers = pool
    .filter(c => {
      const p = progress[c.code];
      return p && p.totalAnswers >= 3 && p.correctAnswers / p.totalAnswers < 0.6;
    })
    .sort((a, b) => {
      const accA = progress[a.code].correctAnswers / progress[a.code].totalAnswers;
      const accB = progress[b.code].correctAnswers / progress[b.code].totalAnswers;
      return accA - accB;
    })
    .filter(c => !confusableSet.has(c.code));

  const combined = [...confusables, ...strugglers].slice(0, SESSION_SIZE);
  if (combined.length < 5) return buildSession(regions, progress);
  return combined;
}

export function buildReviewSession(codes) {
  const codeSet = new Set(codes);
  return shuffle(countries.filter(c => codeSet.has(c.code)));
}

export function getChoices(correct, allCountries, regions, confusablesMode = false) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter(c => regions.includes(c.region));

  // In confusables mode fill with as many look-alikes as possible;
  // otherwise include at most one so the choices stay varied but tricky.
  const group = getConfusableGroup(correct.code);
  const lookalikes = group
    ? shuffle(allCountries.filter(c => group.includes(c.code) && c.code !== correct.code))
    : [];
  const distractors = lookalikes.slice(0, confusablesMode ? 3 : 1);

  const used = new Set([correct.code, ...distractors.map(c => c.code)]);
  const sameRegion = shuffle(pool.filter(c => !used.has(c.code) && c.region === correct.region));
  const elsewhere = shuffle(pool.filter(c => !used.has(c.code) && c.region !== correct.region));
  distractors.push(...[...sameRegion, ...elsewhere].slice(0, 3 - distractors.length));

  return shuffle([correct, ...distractors]);
}

export function getCapitalChoices(correct, allCountries, regions) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter(c => regions.includes(c.region));

  // Same-region capitals are far more confusable, so prefer them as distractors.
  const sameRegion = shuffle(pool.filter(c => c.code !== correct.code && c.region === correct.region));
  const elsewhere = shuffle(pool.filter(c => c.code !== correct.code && c.region !== correct.region));
  const distractors = [...sameRegion, ...elsewhere].slice(0, 3);

  return shuffle([correct, ...distractors]);
}
