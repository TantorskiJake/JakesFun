alter table public.profiles
  add column if not exists weekly_xp integer not null default 0;

alter table public.profiles
  add column if not exists week_start date;

create or replace function public.world_flags_week_start(p_day date default current_date)
returns date
language sql
stable
as $$
  select p_day - ((extract(dow from p_day)::integer + 6) % 7);
$$;

create or replace function public.world_flags_session_xp(p_correct integer, p_total integer)
returns integer
language sql
immutable
as $$
  select case
    when p_correct = p_total then (p_correct * 10) + 50
    else p_correct * 10
  end;
$$;

create or replace function public.world_flags_normalize_answer(p_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(lower(trim(coalesce(p_value, ''))), '^the\s+', ''),
    '\s+the$',
    ''
  );
$$;

create or replace function public.world_flags_expand_answer(p_value text)
returns text
language sql
immutable
as $$
  select case public.world_flags_normalize_answer(p_value)
    when 'usa' then 'united states'
    when 'u.s.a.' then 'united states'
    when 'u.s.' then 'united states'
    when 'us' then 'united states'
    when 'uk' then 'united kingdom'
    when 'u.k.' then 'united kingdom'
    when 'uae' then 'united arab emirates'
    when 'drc' then 'democratic republic of the congo'
    when 'dr congo' then 'democratic republic of the congo'
    when 'car' then 'central african republic'
    else public.world_flags_normalize_answer(p_value)
  end;
$$;

create or replace function public.world_flags_protected_streak_fields(p_streak jsonb)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'currentStreak', coalesce((p_streak->>'currentStreak')::integer, 0),
    'longestStreak', coalesce((p_streak->>'longestStreak')::integer, 0),
    'lastPracticeDate', nullif(p_streak->>'lastPracticeDate', ''),
    'totalXP', coalesce((p_streak->>'totalXP')::integer, 0),
    'level', coalesce((p_streak->>'level')::integer, 1),
    'freezes', coalesce((p_streak->>'freezes')::integer, 0),
    'freezesEarned', coalesce((p_streak->>'freezesEarned')::integer, 0),
    'weeklyXP', coalesce((p_streak->>'weeklyXP')::integer, 0),
    'weekStart', nullif(p_streak->>'weekStart', '')
  );
$$;

create or replace function public.world_flags_guard_server_fields()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.world_flags_session_rpc', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.weekly_xp <> 0
      or new.week_start is not null
      or public.world_flags_protected_streak_fields(new.streak)
        <> public.world_flags_protected_streak_fields('{}'::jsonb)
    then
      raise exception 'streak and leaderboard fields must be updated through submit_quiz_session';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.weekly_xp is distinct from old.weekly_xp
      or new.week_start is distinct from old.week_start
      or public.world_flags_protected_streak_fields(new.streak)
        is distinct from public.world_flags_protected_streak_fields(old.streak)
    then
      raise exception 'streak and leaderboard fields must be updated through submit_quiz_session';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists world_flags_guard_server_fields on public.profiles;
create trigger world_flags_guard_server_fields
before insert or update on public.profiles
for each row execute function public.world_flags_guard_server_fields();

create or replace function public.submit_quiz_session(p_answers jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_yesterday date := current_date - 1;
  v_day_before_yesterday date := current_date - 2;
  v_week_start date := public.world_flags_week_start(current_date);
  v_profile public.profiles;
  v_streak jsonb;
  v_current_streak integer;
  v_longest_streak integer;
  v_total_xp integer;
  v_level integer;
  v_freezes integer;
  v_freezes_earned integer;
  v_weekly_xp integer;
  v_previous_week_start text;
  v_last_practice text;
  v_xp_earned integer;
  v_total integer;
  v_correct integer;
  v_invalid integer;
begin
  if v_user_id is null then
    raise exception 'submit_quiz_session requires an authenticated user';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'quiz session answers must be an array';
  end if;

  v_total := jsonb_array_length(p_answers);
  if v_total < 1 or v_total > 50 then
    raise exception 'quiz session must contain between 1 and 50 answers';
  end if;

  with answer_rows as (
    select
      lower(answer->>'code') as code,
      coalesce(answer->>'mode', 'classic') as mode,
      nullif(lower(answer->>'selectedCode'), '') as selected_code,
      nullif(answer->>'answerText', '') as answer_text
    from jsonb_array_elements(p_answers) as answer
  )
  select count(*)
    into v_invalid
    from answer_rows a
    left join public.world_flags_countries c on c.code = a.code
    where c.code is null
      or a.code !~ '^[a-z]{2}$'
      or a.mode not in ('classic', 'reverse', 'typing', 'capitals', 'confusables', 'map')
      or (a.mode = 'typing' and (a.answer_text is null or length(a.answer_text) > 120))
      or (a.mode <> 'typing' and (a.selected_code is null or a.selected_code !~ '^[a-z]{2}$'));

  if v_invalid > 0 then
    raise exception 'invalid quiz session answer payload';
  end if;

  with answer_rows as (
    select
      lower(answer->>'code') as code,
      coalesce(answer->>'mode', 'classic') as mode,
      nullif(lower(answer->>'selectedCode'), '') as selected_code,
      nullif(answer->>'answerText', '') as answer_text
    from jsonb_array_elements(p_answers) as answer
  )
  select count(*) filter (
    where case
      when a.mode = 'typing' then
        public.world_flags_expand_answer(a.answer_text) = public.world_flags_normalize_answer(c.name)
      else
        a.selected_code = a.code
    end
  )
    into v_correct
    from answer_rows a
    join public.world_flags_countries c on c.code = a.code;

  perform set_config('app.world_flags_session_rpc', 'on', true);

  insert into public.profiles (id, display_name)
  values (v_user_id, coalesce(auth.jwt()->>'email', 'Player'))
  on conflict (id) do nothing;

  select *
    into v_profile
    from public.profiles
    where id = v_user_id
    for update;

  if not found then
    raise exception 'profile not found for authenticated user';
  end if;

  v_streak := coalesce(v_profile.streak, '{}'::jsonb);
  v_last_practice := nullif(v_streak->>'lastPracticeDate', '');
  v_freezes := least(2, greatest(0, coalesce((v_streak->>'freezes')::integer, 0)));
  v_freezes_earned := greatest(0, coalesce((v_streak->>'freezesEarned')::integer, 0));

  if v_last_practice = v_today::text then
    v_current_streak := greatest(0, coalesce((v_streak->>'currentStreak')::integer, 0));
  elsif v_last_practice = v_yesterday::text then
    v_current_streak := greatest(0, coalesce((v_streak->>'currentStreak')::integer, 0)) + 1;
  elsif v_last_practice = v_day_before_yesterday::text and v_freezes > 0 then
    v_freezes := v_freezes - 1;
    v_current_streak := greatest(0, coalesce((v_streak->>'currentStreak')::integer, 0)) + 1;
  else
    v_current_streak := 1;
  end if;

  if v_last_practice is distinct from v_today::text
    and v_current_streak > 0
    and v_current_streak % 7 = 0
  then
    v_freezes_earned := v_freezes_earned + 1;
    v_freezes := least(v_freezes + 1, 2);
  end if;

  v_xp_earned := public.world_flags_session_xp(v_correct, v_total);
  v_total_xp := greatest(0, coalesce((v_streak->>'totalXP')::integer, 0)) + v_xp_earned;
  v_level := floor(v_total_xp / 200) + 1;
  v_longest_streak := greatest(
    v_current_streak,
    greatest(0, coalesce((v_streak->>'longestStreak')::integer, 0))
  );

  v_previous_week_start := nullif(v_streak->>'weekStart', '');
  v_weekly_xp := case
    when v_previous_week_start = v_week_start::text then greatest(0, coalesce((v_streak->>'weeklyXP')::integer, 0))
    else 0
  end + v_xp_earned;

  v_streak := jsonb_build_object(
    'currentStreak', v_current_streak,
    'longestStreak', v_longest_streak,
    'lastPracticeDate', v_today::text,
    'totalXP', v_total_xp,
    'level', v_level,
    'freezes', v_freezes,
    'freezesEarned', v_freezes_earned,
    'weeklyXP', v_weekly_xp,
    'weekStart', v_week_start::text
  );

  update public.profiles
    set streak = v_streak,
        weekly_xp = v_weekly_xp,
        week_start = v_week_start,
        updated_at = now()
    where id = v_user_id;

  return v_streak;
end;
$$;

revoke execute on function public.submit_quiz_session(jsonb) from public;
revoke execute on function public.submit_quiz_session(jsonb) from anon;
grant execute on function public.submit_quiz_session(jsonb) to authenticated;

drop view if exists public.leaderboard;
create view public.leaderboard as
  select id, display_name, weekly_xp, week_start
  from public.profiles
  where weekly_xp > 0;

alter view public.leaderboard set (security_invoker = off);

grant select on public.leaderboard to authenticated;
revoke all on public.leaderboard from anon;
