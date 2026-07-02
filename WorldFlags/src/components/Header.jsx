export default function Header({ view, onNavigate, darkMode, onToggleDark, streak, freezes = 0 }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-mark" aria-hidden="true">WF</span>
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
          Progress
        </button>
        <button
          className={`nav-btn${view === 'map' ? ' nav-btn--active' : ''}`}
          onClick={() => onNavigate('map')}
        >
          Map
        </button>
        <button
          className={`nav-btn${view === 'settings' ? ' nav-btn--active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          Settings
        </button>
      </nav>
      {streak > 0 && (
        <div className="header-streak" title={`${streak}-day streak`}>
          {streak} day
          {freezes > 0 && (
            <span
              className="header-freeze"
              title={`${freezes} streak freeze${freezes === 1 ? '' : 's'} — covers a missed day`}
            >
              ❄️{freezes}
            </span>
          )}
        </div>
      )}
      <button
        className="dark-toggle"
        onClick={onToggleDark}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
