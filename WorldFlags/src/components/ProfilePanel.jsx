import { useState } from 'react';

export default function ProfilePanel({ profile }) {
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    const action = mode === 'sign-up' ? profile.signUp : profile.signIn;
    const result = await action(email.trim(), password);

    if (result?.error) {
      setMessage(result.error.message);
      return;
    }

    setPassword('');
    setMessage(mode === 'sign-up'
      ? 'Account created. Check your email if confirmation is enabled.'
      : 'Signed in.');
  }

  async function handleResetPassword() {
    setMessage('');
    const result = await profile.resetPassword(email);
    setMessage(result?.error ? result.error.message : 'Password reset email sent.');
  }

  function handleExport() {
    const data = profile.exportProfileData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'world-flags-profile-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!profile.configured) {
    return (
      <section className="profile-panel">
        <div>
          <div className="profile-eyebrow">Account infrastructure</div>
          <h2>Cloud accounts are not configured yet</h2>
          <p>Add Supabase environment variables to enable account creation and cross-device sync.</p>
        </div>
      </section>
    );
  }

  if (profile.user) {
    return (
      <section className="profile-panel profile-panel--signed-in">
        <div>
          <div className="profile-eyebrow">Signed in</div>
          <h2>{profile.user.email}</h2>
          <p>{profile.status}</p>
          {profile.error && <p className="profile-error">{profile.error}</p>}
        </div>
        <div className="profile-actions">
          <button className="btn-secondary" onClick={handleExport}>
            Export data
          </button>
          <button className="btn-secondary profile-sign-out" onClick={profile.signOut}>
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-panel">
      <div className="profile-panel-copy">
        <div className="profile-eyebrow">Account</div>
        <h2>Create an account</h2>
        <p>Sign in or create an account to sync progress, streaks, XP, mastery, and badges.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-mode-toggle">
          <button
            type="button"
            className={mode === 'sign-in' ? 'profile-mode-active' : ''}
            onClick={() => setMode('sign-in')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'sign-up' ? 'profile-mode-active' : ''}
            onClick={() => setMode('sign-up')}
          >
            Create
          </button>
        </div>

        <input
          className="profile-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="profile-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          minLength={6}
          required
        />

        <button className="btn-primary profile-submit" type="submit" disabled={profile.loading}>
          {profile.loading ? 'Working...' : mode === 'sign-up' ? 'Create profile' : 'Sign in'}
        </button>

        {mode === 'sign-in' && (
          <button
            className="profile-link-button"
            type="button"
            onClick={handleResetPassword}
            disabled={profile.loading}
          >
            Send password reset
          </button>
        )}

        <div className="profile-oauth-actions">
          <button type="button" className="btn-secondary" onClick={() => profile.signInWithOAuth('google')}>
            Continue with Google
          </button>
          <button type="button" className="btn-secondary" onClick={() => profile.signInWithOAuth('apple')}>
            Continue with Apple
          </button>
        </div>

        {(message || profile.error) && (
          <p className={profile.error ? 'profile-error' : 'profile-message'}>
            {profile.error || message}
          </p>
        )}
      </form>
    </section>
  );
}
