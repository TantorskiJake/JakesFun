import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { weekStartStr } from '../hooks/useStreak.js';

// Never show full email addresses — mask everything from the '@' on.
function maskName(name) {
  if (!name) return 'Anonymous';
  const at = name.indexOf('@');
  return at > 0 ? name.slice(0, at) : name;
}

export default function Leaderboard({ user }) {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!supabase || !user) return undefined;
    let active = true;

    supabase
      .from('leaderboard')
      .select('id, display_name, weekly_xp')
      .eq('week_start', weekStartStr())
      .order('weekly_xp', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setFailed(true);
        } else {
          setRows(data || []);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!isSupabaseConfigured) return null;

  return (
    <div className="stats-section leaderboard-section">
      <h2>Weekly Leaderboard</h2>
      {!user ? (
        <p className="leaderboard-note">Sign in to compete for weekly XP.</p>
      ) : failed ? (
        <p className="leaderboard-note">Leaderboard unavailable.</p>
      ) : rows === null ? (
        <p className="leaderboard-note">Loading leaderboard...</p>
      ) : rows.length === 0 ? (
        <p className="leaderboard-note">No XP on the board yet this week. Finish a session to claim the top spot.</p>
      ) : (
        <ol className="leaderboard-list">
          {rows.map((row, i) => {
            const isMe = row.id === user.id;
            return (
              <li
                key={row.id}
                className={`leaderboard-row${isMe ? ' leaderboard-row--me' : ''}`}
              >
                <span className="leaderboard-rank">{i + 1}</span>
                <span className="leaderboard-name">
                  {maskName(row.display_name)}
                  {isMe && <span className="leaderboard-you"> (you)</span>}
                </span>
                <span className="leaderboard-xp">{row.weekly_xp} XP</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
