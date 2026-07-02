import { useCallback, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { mergeProgress, mergeStreak } from '../utils/profileMerge.js';

function buildProfilePayload(user, progress, streakData) {
  return {
    id: user.id,
    display_name: user.email,
    progress,
    streak: streakData,
    weekly_xp: streakData?.weeklyXP ?? 0,
    week_start: streakData?.weekStart ?? null,
    updated_at: new Date().toISOString(),
  };
}

// Upsert the profile; if the leaderboard columns (supabase/leaderboard.sql)
// haven't been added yet, retry without them so base sync keeps working.
async function upsertProfile(payload) {
  let { error } = await supabase.from('profiles').upsert(payload);
  if (error && /weekly_xp|week_start/i.test(error.message || '')) {
    const { weekly_xp, week_start, ...base } = payload; // eslint-disable-line no-unused-vars
    ({ error } = await supabase.from('profiles').upsert(base));
  }
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
      const mergedStreak = mergeStreak(streakData, data?.streak || {});

      replaceProgress(mergedProgress);
      replaceStreak(mergedStreak);

      const { error: saveError } = await upsertProfile(
        buildProfilePayload(user, mergedProgress, mergedStreak)
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
      const { error: saveError } = await upsertProfile(
        buildProfilePayload(user, progress, streakData)
      );

      if (saveError) {
        setError(saveError.message);
        setStatus('Sync failed');
      } else {
        setError('');
        setStatus('Synced');
      }
    }, 700);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [progress, streakData, user, hasLoadedProfile]);

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
      options: { emailRedirectTo: 'https://jakes-fun.vercel.app' },
    });
    if (result.error) setError(result.error.message);
    setLoading(false);
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

  return {
    configured: isSupabaseConfigured,
    user,
    loading,
    status,
    error,
    signIn,
    signUp,
    signOut,
  };
}
