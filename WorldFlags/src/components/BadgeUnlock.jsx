import { useEffect, useState } from 'react';

export default function BadgeUnlock({ badges, onDismiss }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges.length > 0) {
      setIndex(0);
      setVisible(true);
    }
  }, [badges]);

  if (!visible || badges.length === 0) return null;

  const badge = badges[index];

  function next() {
    if (index + 1 < badges.length) {
      setIndex(i => i + 1);
    } else {
      setVisible(false);
      onDismiss();
    }
  }

  return (
    <div className="badge-overlay" onClick={next} role="dialog" aria-modal="true">
      <div className="badge-card" onClick={e => e.stopPropagation()}>
        <div className="badge-tag">Badge Unlocked!</div>
        <div className="badge-icon">{badge.icon}</div>
        <div className="badge-name">{badge.label}</div>
        <div className="badge-desc">{badge.desc}</div>
        {badges.length > 1 && (
          <div className="badge-count">{index + 1} of {badges.length}</div>
        )}
        <button className="btn-primary" onClick={next} style={{ marginTop: 8 }}>
          {index + 1 < badges.length ? 'Next' : 'Awesome!'}
        </button>
      </div>
    </div>
  );
}
