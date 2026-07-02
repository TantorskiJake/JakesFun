// Local-timezone date helpers. toISOString() is UTC, which shifts evening
// users west of UTC onto tomorrow's date — always format dates locally.

export function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}
