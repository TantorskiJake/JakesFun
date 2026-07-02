import worldData from 'world-atlas/countries-110m.json';

// ISO 3166-1 numeric (zero-padded to 3 chars) → alpha-2 for every country we
// track. Note the 110m world atlas omits many tiny islands and microstates,
// so map-based features must filter to MAP_CODES (derived from the actual
// topology below) rather than this table.
export const NUM_TO_A2 = {
  // Europe
  '008': 'al', '020': 'ad', '051': 'am', '040': 'at', '031': 'az',
  '112': 'by', '056': 'be', '070': 'ba', '100': 'bg', '191': 'hr',
  '196': 'cy', '203': 'cz', '208': 'dk', '233': 'ee', '246': 'fi',
  '250': 'fr', '268': 'ge', '276': 'de', '300': 'gr', '348': 'hu',
  '352': 'is', '372': 'ie', '380': 'it', '398': 'kz', '428': 'lv',
  '438': 'li', '440': 'lt', '442': 'lu', '470': 'mt', '498': 'md',
  '492': 'mc', '499': 'me', '528': 'nl', '807': 'mk', '578': 'no',
  '616': 'pl', '620': 'pt', '642': 'ro', '643': 'ru', '674': 'sm',
  '688': 'rs', '703': 'sk', '705': 'si', '724': 'es', '752': 'se',
  '756': 'ch', '792': 'tr', '804': 'ua', '826': 'gb', '336': 'va',
  // Africa
  '012': 'dz', '024': 'ao', '204': 'bj', '072': 'bw', '854': 'bf',
  '108': 'bi', '132': 'cv', '120': 'cm', '140': 'cf', '148': 'td',
  '174': 'km', '180': 'cd', '178': 'cg', '262': 'dj', '818': 'eg',
  '226': 'gq', '232': 'er', '748': 'sz', '231': 'et', '266': 'ga',
  '270': 'gm', '288': 'gh', '324': 'gn', '624': 'gw', '384': 'ci',
  '404': 'ke', '426': 'ls', '430': 'lr', '434': 'ly', '450': 'mg',
  '454': 'mw', '466': 'ml', '478': 'mr', '480': 'mu', '504': 'ma',
  '508': 'mz', '516': 'na', '562': 'ne', '566': 'ng', '646': 'rw',
  '678': 'st', '686': 'sn', '690': 'sc', '694': 'sl', '706': 'so',
  '710': 'za', '728': 'ss', '729': 'sd', '834': 'tz', '768': 'tg',
  '788': 'tn', '800': 'ug', '894': 'zm', '716': 'zw',
  // Americas
  '028': 'ag', '032': 'ar', '044': 'bs', '052': 'bb', '084': 'bz',
  '068': 'bo', '076': 'br', '124': 'ca', '152': 'cl', '170': 'co',
  '188': 'cr', '192': 'cu', '212': 'dm', '214': 'do', '218': 'ec',
  '222': 'sv', '308': 'gd', '320': 'gt', '328': 'gy', '332': 'ht',
  '340': 'hn', '388': 'jm', '484': 'mx', '558': 'ni', '591': 'pa',
  '600': 'py', '604': 'pe', '659': 'kn', '662': 'lc', '670': 'vc',
  '740': 'sr', '780': 'tt', '840': 'us', '858': 'uy', '862': 've',
  // Asia
  '004': 'af', '048': 'bh', '050': 'bd', '064': 'bt', '096': 'bn',
  '116': 'kh', '156': 'cn', '356': 'in', '360': 'id', '364': 'ir',
  '368': 'iq', '376': 'il', '392': 'jp', '400': 'jo', '414': 'kw',
  '417': 'kg', '418': 'la', '422': 'lb', '458': 'my', '462': 'mv',
  '496': 'mn', '104': 'mm', '524': 'np', '408': 'kp', '512': 'om',
  '586': 'pk', '275': 'ps', '608': 'ph', '634': 'qa', '682': 'sa',
  '702': 'sg', '410': 'kr', '144': 'lk', '760': 'sy', '158': 'tw',
  '762': 'tj', '764': 'th', '626': 'tl', '795': 'tm', '784': 'ae',
  '860': 'uz', '704': 'vn', '887': 'ye',
  // Oceania
  '036': 'au', '242': 'fj', '296': 'ki', '584': 'mh', '583': 'fm',
  '520': 'nr', '554': 'nz', '585': 'pw', '598': 'pg', '882': 'ws',
  '090': 'sb', '776': 'to', '798': 'tv', '548': 'vu',
};

// Alpha-2 codes that actually have a clickable shape in the bundled topology.
const topoIds = new Set(
  worldData.objects.countries.geometries.map(g => String(g.id).padStart(3, '0'))
);

export const MAP_CODES = new Set(
  Object.entries(NUM_TO_A2)
    .filter(([num]) => topoIds.has(num))
    .map(([, alpha2]) => alpha2)
);
