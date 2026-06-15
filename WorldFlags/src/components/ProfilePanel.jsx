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
        <button className="btn-secondary profile-sign-out" onClick={profile.signOut}>
          Sign out
        </button>
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

        {(message || profile.error) && (
          <p className={profile.error ? 'profile-error' : 'profile-message'}>
            {profile.error || message}
          </p>
        )}
      </form>
    </section>
  );
}
