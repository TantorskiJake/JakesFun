import { useEffect, useState } from 'react';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#a78bfa','#fbbf24','#34d399'];

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    setPieces(
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.5 + Math.random() * 2,
        size: 7 + Math.random() * 8,
        isCircle: Math.random() > 0.4,
        rotateEnd: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
      }))
    );
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.isCircle ? p.size : p.size * 0.55,
            height: p.size,
            borderRadius: p.isCircle ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--rotate-end': `${p.rotateEnd}deg`,
          }}
        />
      ))}
    </div>
  );
}
