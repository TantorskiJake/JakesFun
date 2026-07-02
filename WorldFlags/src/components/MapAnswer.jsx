import { useState, useEffect, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import worldData from 'world-atlas/countries-110m.json';
import { NUM_TO_A2 } from '../data/mapCodes.js';
import { countries } from '../data/countries.js';

const BY_CODE = Object.fromEntries(countries.map(c => [c.code, c]));

// Pre-zoom to the target's region so small countries are practical targets;
// the player can still zoom further with the controls or scroll/pinch.
const REGION_VIEWS = {
  europe:   { coordinates: [20, 54],   zoom: 3.4 },
  africa:   { coordinates: [18, 2],    zoom: 2.3 },
  asia:     { coordinates: [84, 28],   zoom: 2.2 },
  americas: { coordinates: [-80, 8],   zoom: 1.8 },
  oceania:  { coordinates: [150, -18], zoom: 2.6 },
};
const DEFAULT_VIEW = { coordinates: [0, 0], zoom: 1 };

export default function MapAnswer({ target, onSelect, feedback }) {
  const [position, setPosition] = useState(
    () => REGION_VIEWS[target?.region] || DEFAULT_VIEW
  );

  // Re-center on the target's region whenever the question changes.
  useEffect(() => {
    setPosition(REGION_VIEWS[target?.region] || DEFAULT_VIEW);
  }, [target]);

  const handleMoveEnd = useCallback((pos) => setPosition(pos), []);

  const handleClick = useCallback((alpha2) => {
    if (!alpha2 || feedback) return;
    onSelect(alpha2);
  }, [feedback, onSelect]);

  const zoomIn  = () => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 2, 16) }));
  const zoomOut = () => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 2, 1) }));
  const reset   = () => setPosition(REGION_VIEWS[target?.region] || DEFAULT_VIEW);

  return (
    <div className="map-answer">
      <div className="map-answer-wrap">
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
            minZoom={1}
            maxZoom={16}
          >
            <Geographies geography={worldData}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const alpha2 = NUM_TO_A2[String(geo.id).padStart(3, '0')];
                  const clickable = !!alpha2 && !!BY_CODE[alpha2];

                  let fill = 'var(--map-quiz-land)';
                  let flashClass = '';
                  if (feedback && alpha2) {
                    if (alpha2 === feedback.correctCode) {
                      fill = 'var(--success)';
                      flashClass = ' map-geo-flash';
                    } else if (!feedback.correct && alpha2 === feedback.selectedCode) {
                      fill = 'var(--error)';
                      flashClass = ' map-geo-flash';
                    }
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={`map-answer-geo${flashClass}`}
                      fill={fill}
                      stroke="var(--map-quiz-stroke)"
                      strokeWidth={0.4}
                      onClick={clickable ? () => handleClick(alpha2) : undefined}
                      style={{
                        default: { outline: 'none', cursor: clickable && !feedback ? 'pointer' : 'default' },
                        hover:   { outline: 'none', filter: clickable && !feedback ? 'brightness(1.25)' : 'none' },
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
    </div>
  );
}
