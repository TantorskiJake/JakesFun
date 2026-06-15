import { countries } from '../data/countries';
import { isDue } from '../utils/sm2';
import { confusableCodes, getConfusableGroup } from '../data/confusables';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSession(regions, progress, sessionSize = 20, confusablesMode = false) {
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

export function getChoices(correct, allCountries, regions, confusablesMode = false) {
  const pool = regions.includes('all')
    ? allCountries
    : allCountries.filter(c => regions.includes(c.region));

  if (confusablesMode) {
    const group = getConfusableGroup(correct.code);
    if (group && group.length > 1) {
      const groupCountries = allCountries.filter(c => group.includes(c.code) && c.code !== correct.code);
      const distractors = shuffle(groupCountries).slice(0, 3);
      if (distractors.length < 3) {
        const extras = shuffle(pool.filter(c => c.code !== correct.code && !group.includes(c.code)));
        distractors.push(...extras.slice(0, 3 - distractors.length));
      }
      return shuffle([correct, ...distractors.slice(0, 3)]);
    }
  }

  const others = shuffle(pool.filter(c => c.code !== correct.code));
  return shuffle([correct, ...others.slice(0, 3)]);
}
