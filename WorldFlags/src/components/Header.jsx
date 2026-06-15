export default function Header({ view, onNavigate, darkMode, onToggleDark, streak }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-globe">🌍</span>
        <span className="header-title">World Flags</span>
      </div>
      <nav className="header-nav">
        <button
          className={`nav-btn${view === 'home' || view === 'quiz' ? ' nav-btn--active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Study
        </button>
        <button
          className={`nav-btn${view === 'stats' ? ' nav-btn--active' : ''}`}
          onClick={() => onNavigate('stats')}
        >
          Stats
        </button>
      </nav>
      {streak > 0 && (
        <div className="header-streak" title={`${streak}-day streak`}>
          🔥 {streak}
        </div>
      )}
      <button
        className="dark-toggle"
        onClick={onToggleDark}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
