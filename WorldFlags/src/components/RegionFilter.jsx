import { REGIONS } from '../data/countries.js';

export default function RegionFilter({ selected, onChange }) {
  function toggle(id) {
    if (id === 'all') {
      onChange(['all']);
      return;
    }
    const without = selected.filter(r => r !== 'all' && r !== id);
    const next = selected.includes(id) ? without : [...without, id];
    onChange(next.length === 0 ? ['all'] : next);
  }

  return (
    <div className="region-filter">
      {REGIONS.map(r => (
        <button
          key={r.id}
          className={`region-btn${selected.includes(r.id) ? ' region-btn--active' : ''}`}
          onClick={() => toggle(r.id)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
