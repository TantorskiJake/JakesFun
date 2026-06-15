// Groups of flags that are commonly confused with each other.
// When confusables mode is active, distractors are drawn from the same group.
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
  ['by', 'hu'],              // Belarus / Hungary (similar bicolor feel)
  ['bo', 'gh'],              // Bolivia / Ghana (similar color blocks)
  ['ng', 'sa'],              // Nigeria-ish / Saudi Arabia-ish (green-white)
  ['kw', 'jo', 'ps'],        // Kuwait / Jordan / Palestine (Pan-Arab colors)
  ['sy', 'ye', 'eg'],        // Arab tricolors (red-white-black)
  ['ug', 'ke', 'et'],        // East African flags (similar stripe patterns)
  ['ag', 'kn', 'vc', 'bb'], // Eastern Caribbean island flags
  ['gy', 'vc'],              // Guyana / St Vincent (similar diagonal designs)
  ['lt', 'ee'],              // Lithuania / Estonia (horizontal tricolors)
  ['lv', 'at'],              // Latvia / Austria (red-white-red)
  ['ba', 'me'],              // Bosnia / Montenegro (similar blue backgrounds with stars)
];

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
  // Return the largest group this code belongs to
  return groups.reduce((best, g) => g.length > best.length ? g : best, groups[0]);
}

export const confusableCodes = new Set(confusableGroups.flat());
