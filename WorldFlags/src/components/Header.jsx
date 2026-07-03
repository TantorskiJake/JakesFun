const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Study',
    isActive: current => current === 'home' || current === 'quiz',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 21V4" />
        <path d="M5 4h12l-2.5 3.5L17 11H5" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Progress',
    isActive: current => current === 'stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M5 20v-8" />
        <path d="M12 20V5" />
        <path d="M19 20v-5" />
      </svg>
    ),
  },
  {
    id: 'map',
    label: 'Map',
    isActive: current => current === 'map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.4 3.7 5.5 3.7 9S14.4 18.6 12 21c-2.4-2.4-3.7-5.5-3.7-9S9.6 5.4 12 3Z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    isActive: current => current === 'settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M4 7h9" />
        <circle cx="17" cy="7" r="2.5" />
        <path d="M20 17h-9" />
        <circle cx="7" cy="17" r="2.5" />
      </svg>
    ),
  },
];

function ThemeIcon({ darkMode }) {
  return darkMode ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z" />
    </svg>
  );
}

export default function Header({ view, onNavigate, darkMode, onToggleDark, streak, freezes = 0 }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-mark" aria-hidden="true">
          <span className="header-mark-grid" />
        </span>
        <span className="header-title">World Flags</span>
      </div>
      <nav className="header-nav" aria-label="Primary">
        {NAV_ITEMS.map(item => {
          const active = item.isActive(view);
          return (
            <button
              key={item.id}
              className={`nav-btn${active ? ' nav-btn--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
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
        <ThemeIcon darkMode={darkMode} />
      </button>
    </header>
  );
}
