// Groups of flags that are commonly confused with each other.
export const confusableGroups = [
  ['ro', 'td'],              // Romania / Chad (almost identical, different shade of blue)
  ['id', 'mc', 'pl'],       // Indonesia / Monaco / Poland (red-white, flipped for Poland)
  ['ie', 'ci'],              // Ireland / Ivory Coast (green-white-orange, reversed)
  ['nz', 'au', 'fj'],       // New Zealand / Australia / Fiji (Southern Cross + Union Jack)
  ['co', 've', 'ec'],        // Colombia / Venezuela / Ecuador (Andean yellow-blue-red)
  ['sn', 'ml', 'gn'],        // Senegal / Mali / Guinea (Pan-African, star variations)
  ['no', 'is', 'dk', 'fi'], // Nordic cross family
  ['ru', 'nl', 'fr', 'lu'], // Horizontal tricolors
  ['si', 'sk', 'hr'],        // Slavic tricolors with coat of arms
  ['cg', 'cd'],              // Republic of Congo / DR Congo
  ['cm', 'sn', 'gn', 'ml'], // Pan-African vertical tricolors
  ['us', 'lr'],              // USA / Liberia (stars and stripes)
  ['ht', 'li'],              // Haiti / Liechtenstein (blue-red bicolor)
  ['gb', 'nz', 'au'],       // Union Jack family
  ['kw', 'jo', 'ps'],        // Kuwait / Jordan / Palestine (Pan-Arab)
  ['sy', 'ye', 'eg'],        // Arab tricolors (red-white-black)
  ['ag', 'kn', 'vc', 'bb'], // Eastern Caribbean island flags
  ['lt', 'ee'],              // Lithuania / Estonia
  ['lv', 'at'],              // Latvia / Austria (red-white-red)
  ['mx', 'it'],              // Mexico / Italy (green-white-red)
  ['nl', 'lu', 'hr'],        // Netherlands / Luxembourg / Croatia
];

// Alias used by buildTrickySession
export const CONFUSABLE_GROUPS = confusableGroups;

const groupMap = new Map();
confusableGroups.forEach(group => {
  group.forEach(code => {
    if (!groupMap.has(code)) groupMap.set(code, []);
    groupMap.get(code).push(group);
  });
});

export function getConfusableGroup(code) {
  const groups = groupMap.get(code);
  if (!groups || groups.length === 0) return null;
  return groups.reduce((best, g) => g.length > best.length ? g : best, groups[0]);
}

export const confusableCodes = new Set(confusableGroups.flat());
