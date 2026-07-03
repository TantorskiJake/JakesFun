import { useCallback, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { mergeProgress, mergeStreak } from '../utils/profileMerge.js';
import { validateSessionResults } from '../utils/sessionScoring.js';

function hasServerStreak(streak) {
  return streak && typeof streak === 'object' && Object.keys(streak).length > 0;
}

export function buildProfilePayload(user, progress) {
  return {
    id: user.id,
    display_name: user.email,
    progress,
    updated_at: new Date().toISOString(),
  };
}

async function upsertProfile(payload) {
  const { error } = await supabase.from('profiles').upsert(payload);
  return { error };
}

export function useProfileSync({
  progress,
  streakData,
  replaceProgress,
  replaceStreak,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [status, setStatus] = useState(
    isSupabaseConfigured ? 'Checking profile...' : 'Cloud sync is not configured'
  );
  const [error, setError] = useState('');
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (!user) {
      setHasLoadedProfile(false);
      setStatus('Not signed in');
      return;
    }

    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError('');
      setStatus('Syncing profile...');

      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('progress, streak')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      if (loadError) {
        setError(loadError.message);
        setStatus('Sync failed');
        setLoading(false);
        return;
      }

      const mergedProgress = mergeProgress(progress, data?.progress || {});
      const mergedStreak = hasServerStreak(data?.streak)
        ? mergeStreak({}, data.streak)
        : mergeStreak(streakData, {});

      replaceProgress(mergedProgress);
      replaceStreak(mergedStreak);

      const { error: saveError } = await upsertProfile(
        buildProfilePayload(user, mergedProgress)
      );

      if (!active) return;

      if (saveError) {
        setError(saveError.message);
        setStatus('Sync failed');
      } else {
        setHasLoadedProfile(true);
        setStatus('Synced');
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
    // Load only when the user changes; progress/streak here is the local snapshot at sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!supabase || !user || !hasLoadedProfile) return undefined;

    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      // Merge with the current server row first so two devices don't
      // clobber each other with last-write-wins upserts.
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('progress, streak')
        .eq('id', user.id)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        setStatus('Sync failed');
        return;
      }

      const mergedProgress = mergeProgress(progress, data?.progress || {});
      const mergedStreak = hasServerStreak(data?.streak)
        ? mergeStreak({}, data.streak)
        : mergeStreak(streakData, {});

      const { error: saveError } = await upsertProfile(
        buildProfilePayload(user, mergedProgress)
      );

      if (saveError) {
        setError(saveError.message);
        setStatus('Sync failed');
      } else {
        // Pull merged cloud data into local state — but only when it
        // actually differs, so we don't loop through this effect forever.
        if (JSON.stringify(mergedProgress) !== JSON.stringify(progress)) {
          replaceProgress(mergedProgress);
        }
        if (JSON.stringify(mergedStreak) !== JSON.stringify(streakData)) {
          replaceStreak(mergedStreak);
        }
        setError('');
        setStatus('Synced');
      }
    }, 700);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [progress, streakData, user, hasLoadedProfile, replaceProgress, replaceStreak]);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: new Error('Cloud sync is not configured') };
    setLoading(true);
    setError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    setLoading(false);
    return result;
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!supabase) return { error: new Error('Cloud sync is not configured') };
    setLoading(true);
    setError('');
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,
      },
    });
    if (result.error) setError(result.error.message);
    setLoading(false);
    return result;
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!supabase) return { error: new Error('Cloud sync is not configured') };
    const trimmed = email.trim();
    if (!trimmed) return { error: new Error('Enter your email address first.') };
    const result = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,
    });
    if (result.error) setError(result.error.message);
    return result;
  }, []);

  const signInWithOAuth = useCallback(async (provider) => {
    if (!supabase) return { error: new Error('Cloud sync is not configured') };
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,
      },
    });
    if (result.error) setError(result.error.message);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError('');
    await supabase.auth.signOut();
    setUser(null);
    setHasLoadedProfile(false);
    setLoading(false);
  }, []);

  const exportProfileData = useCallback(() => ({
    exportedAt: new Date().toISOString(),
    user: user ? { id: user.id, email: user.email } : null,
    progress,
    streak: streakData,
  }), [progress, streakData, user]);

  const submitSessionResult = useCallback(async ({ results }) => {
    if (!supabase || !user) {
      return { error: new Error('Cloud sync is not configured') };
    }

    const result = validateSessionResults(results);
    if (!result.valid) {
      return { error: new Error(result.error) };
    }

    const { data, error: rpcError } = await supabase.rpc('submit_quiz_session', {
      p_answers: result.answers,
    });

    if (rpcError) {
      setError(rpcError.message);
      setStatus('Sync failed');
      return { error: rpcError };
    }

    setError('');
    setStatus('Synced');
    return { data };
  }, [user]);

  return {
    configured: isSupabaseConfigured,
    user,
    loading,
    status,
    error,
    signIn,
    signUp,
    resetPassword,
    signInWithOAuth,
    signOut,
    exportProfileData,
    submitSessionResult,
  };
}
