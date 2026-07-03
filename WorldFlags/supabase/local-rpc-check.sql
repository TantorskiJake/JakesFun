begin;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'local-test@example.com',
  '',
  now(),
  now(),
  now()
)
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.email', 'local-test@example.com', true);

select public.submit_quiz_session(
  '[
    {"code":"fr","mode":"classic","selectedCode":"fr"},
    {"code":"jp","mode":"typing","answerText":"Japan"},
    {"code":"de","mode":"classic","selectedCode":"fr"}
  ]'::jsonb
) as streak_after_session;

select id, weekly_xp, week_start, streak->>'totalXP' as total_xp
from public.profiles
where id = '00000000-0000-0000-0000-000000000001';

do $$
begin
  update public.profiles
    set weekly_xp = 999999
    where id = '00000000-0000-0000-0000-000000000001';

  raise exception 'direct weekly_xp update unexpectedly succeeded';
exception
  when others then
    if sqlerrm = 'direct weekly_xp update unexpectedly succeeded' then
      raise;
    end if;
    raise notice 'direct weekly_xp update rejected: %', sqlerrm;
end;
$$;

rollback;
