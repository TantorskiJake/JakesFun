import ProfilePanel from './ProfilePanel.jsx';
import RegionFilter from './RegionFilter.jsx';

const MODES = [
  { id: 'classic', label: 'Flag', desc: 'Flag to name' },
  { id: 'reverse', label: 'Match', desc: 'Name to flag' },
  { id: 'typing', label: 'Type', desc: 'Free response' },
  { id: 'capitals', label: 'Capitals', desc: 'Flag to capital' },
  { id: 'confusables', label: 'Confusables', desc: 'Look-alike flags' },
];

const SESSION_SIZES = [10, 20, 30];

export default function SettingsView({
  profile,
  darkMode,
  onToggleDark,
  quizMode,
  onQuizModeChange,
  sessionSize,
  onSessionSizeChange,
  selectedRegions,
  onRegionsChange,
  onResetProgress,
}) {
  function handleReset() {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onResetProgress();
    }
  }

  return (
    <div className="settings-view">
      <section className="settings-hero">
        <div>
          <span className="home-kicker">Settings</span>
          <h1>Account and app defaults</h1>
          <p>Create an account, sync progress, and choose the defaults used when you tap Practice now.</p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-copy">
          <h2>Account</h2>
          <p>Use an account to keep mastery, streaks, XP, and badges available across devices.</p>
        </div>
        <ProfilePanel profile={profile} />
      </section>

      <section className="settings-section">
        <div className="settings-section-copy">
          <h2>Practice Defaults</h2>
          <p>These settings control the one-click practice session on the Study page.</p>
        </div>

        <div className="settings-card">
          <div className="settings-field">
            <div>
              <h3>Default lesson type</h3>
              <p>Pick the style you want Practice now to launch.</p>
            </div>
            <div className="quiz-mode-toggle">
              {MODES.map(mode => (
                <button
                  key={mode.id}
                  className={`quiz-mode-btn${quizMode === mode.id ? ' quiz-mode-btn--active' : ''}`}
                  onClick={() => onQuizModeChange(mode.id)}
                >
                  {mode.label}
                  <span className="quiz-mode-desc">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-field settings-field--inline">
            <div>
              <h3>Questions per session</h3>
              <p>Keep sessions quick, or make them a little longer.</p>
            </div>
            <div className="size-selector">
              {SESSION_SIZES.map(size => (
                <button
                  key={size}
                  className={`size-btn${sessionSize === size ? ' size-btn--active' : ''}`}
                  onClick={() => onSessionSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-field">
            <div>
              <h3>Default course</h3>
              <p>Choose the region mix used for normal practice.</p>
            </div>
            <RegionFilter selected={selectedRegions} onChange={onRegionsChange} />
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-copy">
          <h2>App</h2>
          <p>Display and local progress controls.</p>
        </div>

        <div className="settings-card">
          <div className="settings-field settings-field--inline">
            <div>
              <h3>Theme</h3>
              <p>Switch between light and dark mode.</p>
            </div>
            <button className="btn-secondary" onClick={onToggleDark}>
              {darkMode ? 'Use light mode' : 'Use dark mode'}
            </button>
          </div>

          <div className="settings-field settings-field--inline settings-field--danger">
            <div>
              <h3>Reset progress</h3>
              <p>Clear local mastery, accuracy, streaks, and review history.</p>
            </div>
            <button className="btn-danger-ghost" onClick={handleReset}>
              Reset progress
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
