// Bottom tab bar shown on narrow screens; the header nav covers desktop.
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4h12l-2.5 3.5L17 11H5" />
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 20v-8" />
      <path d="M12 20V5" />
      <path d="M19 20v-5" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.4 3.7 5.5 3.7 9S14.4 18.6 12 21c-2.4-2.4-3.7-5.5-3.7-9S9.6 5.4 12 3Z" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h9" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M20 17h-9" />
      <circle cx="7" cy="17" r="2.5" />
    </svg>
  ),
};

const TABS = [
  { id: 'home', label: 'Study', isActive: view => view === 'home' || view === 'quiz' },
  { id: 'stats', label: 'Progress', isActive: view => view === 'stats' },
  { id: 'map', label: 'Map', isActive: view => view === 'map' },
  { id: 'settings', label: 'Settings', isActive: view => view === 'settings' },
];

export default function TabBar({ view, onNavigate }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn${tab.isActive(view) ? ' tab-btn--active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-current={tab.isActive(view) ? 'page' : undefined}
        >
          {ICONS[tab.id]}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
