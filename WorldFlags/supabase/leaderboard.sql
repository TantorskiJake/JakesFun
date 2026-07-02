-- Weekly XP leaderboard for World Flags.
--
-- How to run: open your Supabase project dashboard -> SQL Editor ->
-- New query -> paste this file -> Run. Requires profile-sync.sql to have
-- been applied first (it creates public.profiles).
--
-- What it does:
--   1. Adds weekly_xp / week_start columns to public.profiles. The client
--      resets weekly_xp whenever week_start no longer matches the current
--      week's Monday.
--   2. Exposes a read-only public.leaderboard view. RLS policies cannot
--      restrict columns, and widening SELECT on profiles would leak every
--      user's progress/streak data — so the view (owned by postgres, not
--      subject to the caller's RLS) publishes only id, display_name,
--      weekly_xp and week_start to authenticated users. Writes to profiles
--      stay owner-only via the existing policies from profile-sync.sql.

alter table public.profiles
  add column if not exists weekly_xp integer not null default 0;

alter table public.profiles
  add column if not exists week_start date;

drop view if exists public.leaderboard;
create view public.leaderboard as
  select id, display_name, weekly_xp, week_start
  from public.profiles
  where weekly_xp > 0;

-- Intentionally run with the view owner's privileges so authenticated users
-- can read leaderboard rows without gaining access to other profile columns.
alter view public.leaderboard set (security_invoker = off);

grant select on public.leaderboard to authenticated;
revoke all on public.leaderboard from anon;
