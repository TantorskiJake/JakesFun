import { useState, useEffect } from 'react';
import { getFlagUrl } from '../data/countries.js';

export default function FlagCard({ code }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [code]);

  return (
    <div className="flag-card">
      <p className="flag-card-prompt">Remember this flag</p>
      <div className="flag-image-wrap">
        {!loaded && !error && (
          <div className="flag-spinner">
            <div className="spinner" />
          </div>
        )}
        {error ? (
          <div className="flag-error">
            <span className="flag-error-icon">N/A</span>
            <span>Flag not available</span>
          </div>
        ) : (
          <img
            key={code}
            src={getFlagUrl(code)}
            alt="Country flag"
            className={`flag-image${loaded ? '' : ' flag-image--loading'}`}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
          />
        )}
      </div>
    </div>
  );
}
