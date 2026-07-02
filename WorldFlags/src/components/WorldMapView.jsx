import { useMemo, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import worldData from 'world-atlas/countries-110m.json';
import { countries, REGIONS, getFlagUrl } from '../data/countries.js';
import { NUM_TO_A2 } from '../data/mapCodes.js';
import { masteryLevel } from '../utils/sm2.js';

const BY_CODE = Object.fromEntries(countries.map(c => [c.code, c]));

const C = {
  notLearned: '#ef4444',
  learning:   '#eab308',
  learned:    '#22c55e',
  gold:       '#f59e0b',
  untracked:  '#475569',
};

function getColor(card) {
  if (!card || card.totalAnswers === 0) return C.notLearned;
  if (card.totalAnswers >= 5 && card.correctAnswers === card.totalAnswers) return C.gold;
  const level = masteryLevel(card);
  if (level >= 3) return C.learned;
  if (level >= 1) return C.learning;
  return C.notLearned;
}

function getLabel(card) {
  if (!card || card.totalAnswers === 0) return 'Not learned';
  if (card.totalAnswers >= 5 && card.correctAnswers === card.totalAnswers) return '★ Perfect';
  const level = masteryLevel(card);
  if (level >= 3) return 'Learned';
  if (level >= 1) return 'Learning';
  return 'Not learned';
}

const LEGEND = [
  { color: C.notLearned, label: 'Not learned' },
  { color: C.learning,   label: 'Learning' },
  { color: C.learned,    label: 'Learned' },
  { color: C.gold,       label: 'Perfect (5+ attempts, no errors)' },
  { color: C.untracked,  label: 'Not in study set' },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Needs work' },
  { id: 'unseen', label: 'Unseen' },
  { id: 'mastered', label: 'Mastered' },
];

export default function WorldMapView({ progress, onPracticeRegions }) {
  const [tooltip, setTooltip] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const mapStats = useMemo(() => {
    const unseen = countries.filter(c => !progress[c.code] || progress[c.code].totalAnswers === 0).length;
    const learning = countries.filter(c => {
      const card = progress[c.code];
      const level = masteryLevel(card);
      return card?.totalAnswers > 0 && level < 3;
    }).length;
    const mastered = countries.filter(c => masteryLevel(progress[c.code]) >= 3).length;
    const perfect = countries.filter(c => {
      const card = progress[c.code];
      return card?.totalAnswers >= 5 && card.correctAnswers === card.totalAnswers;
    }).length;
    return { unseen, learning, mastered, perfect };
  }, [progress]);

  function matchesFilter(alpha2) {
    const card = progress[alpha2] || null;
    if (filter === 'unseen') return !card || card.totalAnswers === 0;
    if (filter === 'mastered') return masteryLevel(card) >= 3;
    if (filter === 'due') return card?.totalAnswers > 0 && masteryLevel(card) < 3;
    return true;
  }

  function selectCountry(alpha2) {
    const country = BY_CODE[alpha2];
    if (!country) return;
    const card = progress[alpha2] || null;
    const acc = card?.totalAnswers > 0
      ? Math.round((card.correctAnswers / card.totalAnswers) * 100)
      : null;
    setSelected({
      ...country,
      status: getLabel(card),
      color: getColor(card),
      acc,
      answers: card?.totalAnswers ?? 0,
    });
  }

  const handleEnter = useCallback((evt, geo) => {
    const alpha2 = NUM_TO_A2[String(geo.id).padStart(3, '0')];
    if (!alpha2 || !BY_CODE[alpha2]) return;
    const card = progress[alpha2] || null;
    const acc = card?.totalAnswers > 0
      ? Math.round((card.correctAnswers / card.totalAnswers) * 100)
      : null;
    setTooltip({
      name: BY_CODE[alpha2].name,
      status: getLabel(card),
      color: getColor(card),
      acc,
      answers: card?.totalAnswers ?? 0,
      x: evt.clientX,
      y: evt.clientY,
    });
  }, [progress]);

  const handleMove = useCallback((evt, geo) => {
    const alpha2 = NUM_TO_A2[String(geo.id).padStart(3, '0')];
    if (!alpha2 || !BY_CODE[alpha2]) return;
    setTooltip(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);
  const handleMoveEnd = useCallback((pos) => setPosition(pos), []);

  const zoomIn  = () => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 2, 10) }));
  const zoomOut = () => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 2, 1) }));
  const reset   = () => setPosition({ coordinates: [0, 0], zoom: 1 });

  return (
    <div className="map-view">
      <div className="map-page-header">
        <div>
          <span className="home-kicker">World Map</span>
          <h1>Explore your flag mastery</h1>
          <p>Use the map to spot gaps, review regions, and pick what to practice next.</p>
        </div>
        <div className="map-summary-grid">
          <div><strong>{mapStats.unseen}</strong><span>unseen</span></div>
          <div><strong>{mapStats.learning}</strong><span>learning</span></div>
          <div><strong>{mapStats.mastered}</strong><span>mastered</span></div>
          <div><strong>{mapStats.perfect}</strong><span>perfect</span></div>
        </div>
      </div>

      <div className="map-toolbar">
        <div className="map-filter-group" aria-label="Map filter">
          {FILTERS.map(item => (
            <button
              key={item.id}
              className={`map-filter-btn${filter === item.id ? ' map-filter-btn--active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="map-region-actions">
          {REGIONS.filter(region => region.id !== 'all').map(region => (
            <button
              key={region.id}
              className="btn-ghost"
              onClick={() => onPracticeRegions?.([region.id])}
            >
              Practice {region.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-layout">
        <div className="map-wrap">
          <div className="map-zoom-controls">
            <button className="map-zoom-btn" onClick={zoomIn}  title="Zoom in">+</button>
            <button className="map-zoom-btn" onClick={zoomOut} title="Zoom out">−</button>
            <button className="map-zoom-btn map-zoom-reset" onClick={reset} title="Reset view">↺</button>
          </div>

          <ComposableMap
            projectionConfig={{ scale: 153, rotate: [-10, 0, 0] }}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
            >
              <Geographies geography={worldData}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const alpha2 = NUM_TO_A2[String(geo.id).padStart(3, '0')];
                    const tracked = !!alpha2 && !!BY_CODE[alpha2];
                    const card = tracked ? (progress[alpha2] || null) : null;
                    const visible = tracked ? matchesFilter(alpha2) : false;
                    const fill = tracked && visible ? getColor(card) : C.untracked;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#0f172a"
                        strokeWidth={0.4}
                        onMouseEnter={tracked ? (e) => handleEnter(e, geo) : undefined}
                        onMouseMove={tracked ? (e) => handleMove(e, geo) : undefined}
                        onMouseLeave={tracked ? handleLeave : undefined}
                        onClick={tracked ? () => selectCountry(alpha2) : undefined}
                        style={{
                          default: { outline: 'none', cursor: tracked ? 'pointer' : 'default', opacity: tracked && !visible ? 0.24 : 1 },
                          hover:   { outline: 'none', filter: tracked ? 'brightness(1.25)' : 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <aside className="map-detail-panel">
          {selected ? (
            <>
              <img src={getFlagUrl(selected.code)} alt="" className="map-detail-flag" />
              <div>
                <h2>{selected.name}</h2>
                <p style={{ color: selected.color }}>{selected.status}</p>
              </div>
              <div className="map-detail-stats">
                <div><strong>{selected.acc ?? '—'}</strong><span>accuracy</span></div>
                <div><strong>{selected.answers}</strong><span>answers</span></div>
              </div>
              <button className="btn-primary" onClick={() => onPracticeRegions?.([selected.region])}>
                Practice {REGIONS.find(r => r.id === selected.region)?.label ?? 'region'}
              </button>
            </>
          ) : (
            <>
              <h2>Select a country</h2>
              <p>Click any tracked country to see its flag, status, and a quick way to practice that region.</p>
            </>
          )}
        </aside>
      </div>

      <div className="map-legend">
        {LEGEND.map(({ color, label }) => (
          <div className="map-legend-item" key={label}>
            <span className="map-legend-dot" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
        >
          <div className="map-tooltip-name">{tooltip.name}</div>
          <div className="map-tooltip-status" style={{ color: tooltip.color }}>
            {tooltip.status}
          </div>
          {tooltip.answers > 0 && (
            <div className="map-tooltip-stats">
              {tooltip.acc}% accuracy · {tooltip.answers} answer{tooltip.answers !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
