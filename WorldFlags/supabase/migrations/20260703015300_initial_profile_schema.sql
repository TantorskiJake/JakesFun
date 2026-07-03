create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  progress jsonb not null default '{}'::jsonb,
  streak jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  weekly_xp integer not null default 0,
  week_start date
);

create table if not exists public.world_flags_countries (
  code text primary key,
  name text not null,
  capital text not null,
  region text not null
);

alter table public.profiles enable row level security;
alter table public.world_flags_countries enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Authenticated users can read countries" on public.world_flags_countries;
create policy "Authenticated users can read countries"
  on public.world_flags_countries
  for select
  to authenticated
  using (true);

grant select on public.world_flags_countries to authenticated;

insert into public.world_flags_countries (code, name, capital, region) values
  ('al', 'Albania', 'Tirana', 'europe'),
  ('ad', 'Andorra', 'Andorra la Vella', 'europe'),
  ('am', 'Armenia', 'Yerevan', 'europe'),
  ('at', 'Austria', 'Vienna', 'europe'),
  ('az', 'Azerbaijan', 'Baku', 'europe'),
  ('by', 'Belarus', 'Minsk', 'europe'),
  ('be', 'Belgium', 'Brussels', 'europe'),
  ('ba', 'Bosnia and Herzegovina', 'Sarajevo', 'europe'),
  ('bg', 'Bulgaria', 'Sofia', 'europe'),
  ('hr', 'Croatia', 'Zagreb', 'europe'),
  ('cy', 'Cyprus', 'Nicosia', 'europe'),
  ('cz', 'Czech Republic', 'Prague', 'europe'),
  ('dk', 'Denmark', 'Copenhagen', 'europe'),
  ('ee', 'Estonia', 'Tallinn', 'europe'),
  ('fi', 'Finland', 'Helsinki', 'europe'),
  ('fr', 'France', 'Paris', 'europe'),
  ('ge', 'Georgia', 'Tbilisi', 'europe'),
  ('de', 'Germany', 'Berlin', 'europe'),
  ('gr', 'Greece', 'Athens', 'europe'),
  ('hu', 'Hungary', 'Budapest', 'europe'),
  ('is', 'Iceland', 'Reykjavik', 'europe'),
  ('ie', 'Ireland', 'Dublin', 'europe'),
  ('it', 'Italy', 'Rome', 'europe'),
  ('kz', 'Kazakhstan', 'Astana', 'europe'),
  ('xk', 'Kosovo', 'Pristina', 'europe'),
  ('lv', 'Latvia', 'Riga', 'europe'),
  ('li', 'Liechtenstein', 'Vaduz', 'europe'),
  ('lt', 'Lithuania', 'Vilnius', 'europe'),
  ('lu', 'Luxembourg', 'Luxembourg City', 'europe'),
  ('mt', 'Malta', 'Valletta', 'europe'),
  ('md', 'Moldova', 'Chisinau', 'europe'),
  ('mc', 'Monaco', 'Monaco', 'europe'),
  ('me', 'Montenegro', 'Podgorica', 'europe'),
  ('nl', 'Netherlands', 'Amsterdam', 'europe'),
  ('mk', 'North Macedonia', 'Skopje', 'europe'),
  ('no', 'Norway', 'Oslo', 'europe'),
  ('pl', 'Poland', 'Warsaw', 'europe'),
  ('pt', 'Portugal', 'Lisbon', 'europe'),
  ('ro', 'Romania', 'Bucharest', 'europe'),
  ('ru', 'Russia', 'Moscow', 'europe'),
  ('sm', 'San Marino', 'San Marino', 'europe'),
  ('rs', 'Serbia', 'Belgrade', 'europe'),
  ('sk', 'Slovakia', 'Bratislava', 'europe'),
  ('si', 'Slovenia', 'Ljubljana', 'europe'),
  ('es', 'Spain', 'Madrid', 'europe'),
  ('se', 'Sweden', 'Stockholm', 'europe'),
  ('ch', 'Switzerland', 'Bern', 'europe'),
  ('tr', 'Turkey', 'Ankara', 'europe'),
  ('ua', 'Ukraine', 'Kyiv', 'europe'),
  ('gb', 'United Kingdom', 'London', 'europe'),
  ('va', 'Vatican City', 'Vatican City', 'europe'),
  ('dz', 'Algeria', 'Algiers', 'africa'),
  ('ao', 'Angola', 'Luanda', 'africa'),
  ('bj', 'Benin', 'Porto-Novo', 'africa'),
  ('bw', 'Botswana', 'Gaborone', 'africa'),
  ('bf', 'Burkina Faso', 'Ouagadougou', 'africa'),
  ('bi', 'Burundi', 'Gitega', 'africa'),
  ('cv', 'Cabo Verde', 'Praia', 'africa'),
  ('cm', 'Cameroon', 'Yaounde', 'africa'),
  ('cf', 'Central African Republic', 'Bangui', 'africa'),
  ('td', 'Chad', 'N''Djamena', 'africa'),
  ('km', 'Comoros', 'Moroni', 'africa'),
  ('cd', 'Democratic Republic of the Congo', 'Kinshasa', 'africa'),
  ('cg', 'Republic of the Congo', 'Brazzaville', 'africa'),
  ('dj', 'Djibouti', 'Djibouti', 'africa'),
  ('eg', 'Egypt', 'Cairo', 'africa'),
  ('gq', 'Equatorial Guinea', 'Malabo', 'africa'),
  ('er', 'Eritrea', 'Asmara', 'africa'),
  ('sz', 'Eswatini', 'Mbabane', 'africa'),
  ('et', 'Ethiopia', 'Addis Ababa', 'africa'),
  ('ga', 'Gabon', 'Libreville', 'africa'),
  ('gm', 'Gambia', 'Banjul', 'africa'),
  ('gh', 'Ghana', 'Accra', 'africa'),
  ('gn', 'Guinea', 'Conakry', 'africa'),
  ('gw', 'Guinea-Bissau', 'Bissau', 'africa'),
  ('ci', 'Ivory Coast', 'Yamoussoukro', 'africa'),
  ('ke', 'Kenya', 'Nairobi', 'africa'),
  ('ls', 'Lesotho', 'Maseru', 'africa'),
  ('lr', 'Liberia', 'Monrovia', 'africa'),
  ('ly', 'Libya', 'Tripoli', 'africa'),
  ('mg', 'Madagascar', 'Antananarivo', 'africa'),
  ('mw', 'Malawi', 'Lilongwe', 'africa'),
  ('ml', 'Mali', 'Bamako', 'africa'),
  ('mr', 'Mauritania', 'Nouakchott', 'africa'),
  ('mu', 'Mauritius', 'Port Louis', 'africa'),
  ('ma', 'Morocco', 'Rabat', 'africa'),
  ('mz', 'Mozambique', 'Maputo', 'africa'),
  ('na', 'Namibia', 'Windhoek', 'africa'),
  ('ne', 'Niger', 'Niamey', 'africa'),
  ('ng', 'Nigeria', 'Abuja', 'africa'),
  ('rw', 'Rwanda', 'Kigali', 'africa'),
  ('st', 'Sao Tome and Principe', 'São Tomé', 'africa'),
  ('sn', 'Senegal', 'Dakar', 'africa'),
  ('sc', 'Seychelles', 'Victoria', 'africa'),
  ('sl', 'Sierra Leone', 'Freetown', 'africa'),
  ('so', 'Somalia', 'Mogadishu', 'africa'),
  ('za', 'South Africa', 'Pretoria', 'africa'),
  ('ss', 'South Sudan', 'Juba', 'africa'),
  ('sd', 'Sudan', 'Khartoum', 'africa'),
  ('tz', 'Tanzania', 'Dodoma', 'africa'),
  ('tg', 'Togo', 'Lome', 'africa'),
  ('tn', 'Tunisia', 'Tunis', 'africa'),
  ('ug', 'Uganda', 'Kampala', 'africa'),
  ('zm', 'Zambia', 'Lusaka', 'africa'),
  ('zw', 'Zimbabwe', 'Harare', 'africa'),
  ('ag', 'Antigua and Barbuda', 'Saint John''s', 'americas'),
  ('ar', 'Argentina', 'Buenos Aires', 'americas'),
  ('bs', 'Bahamas', 'Nassau', 'americas'),
  ('bb', 'Barbados', 'Bridgetown', 'americas'),
  ('bz', 'Belize', 'Belmopan', 'americas'),
  ('bo', 'Bolivia', 'Sucre', 'americas'),
  ('br', 'Brazil', 'Brasilia', 'americas'),
  ('ca', 'Canada', 'Ottawa', 'americas'),
  ('cl', 'Chile', 'Santiago', 'americas'),
  ('co', 'Colombia', 'Bogota', 'americas'),
  ('cr', 'Costa Rica', 'San Jose', 'americas'),
  ('cu', 'Cuba', 'Havana', 'americas'),
  ('dm', 'Dominica', 'Roseau', 'americas'),
  ('do', 'Dominican Republic', 'Santo Domingo', 'americas'),
  ('ec', 'Ecuador', 'Quito', 'americas'),
  ('sv', 'El Salvador', 'San Salvador', 'americas'),
  ('gd', 'Grenada', 'Saint George''s', 'americas'),
  ('gt', 'Guatemala', 'Guatemala City', 'americas'),
  ('gy', 'Guyana', 'Georgetown', 'americas'),
  ('ht', 'Haiti', 'Port-au-Prince', 'americas'),
  ('hn', 'Honduras', 'Tegucigalpa', 'americas'),
  ('jm', 'Jamaica', 'Kingston', 'americas'),
  ('mx', 'Mexico', 'Mexico City', 'americas'),
  ('ni', 'Nicaragua', 'Managua', 'americas'),
  ('pa', 'Panama', 'Panama City', 'americas'),
  ('py', 'Paraguay', 'Asuncion', 'americas'),
  ('pe', 'Peru', 'Lima', 'americas'),
  ('kn', 'Saint Kitts and Nevis', 'Basseterre', 'americas'),
  ('lc', 'Saint Lucia', 'Castries', 'americas'),
  ('vc', 'Saint Vincent and the Grenadines', 'Kingstown', 'americas'),
  ('sr', 'Suriname', 'Paramaribo', 'americas'),
  ('tt', 'Trinidad and Tobago', 'Port of Spain', 'americas'),
  ('us', 'United States', 'Washington D.C.', 'americas'),
  ('uy', 'Uruguay', 'Montevideo', 'americas'),
  ('ve', 'Venezuela', 'Caracas', 'americas'),
  ('af', 'Afghanistan', 'Kabul', 'asia'),
  ('bh', 'Bahrain', 'Manama', 'asia'),
  ('bd', 'Bangladesh', 'Dhaka', 'asia'),
  ('bt', 'Bhutan', 'Thimphu', 'asia'),
  ('bn', 'Brunei', 'Bandar Seri Begawan', 'asia'),
  ('kh', 'Cambodia', 'Phnom Penh', 'asia'),
  ('cn', 'China', 'Beijing', 'asia'),
  ('in', 'India', 'New Delhi', 'asia'),
  ('id', 'Indonesia', 'Jakarta', 'asia'),
  ('ir', 'Iran', 'Tehran', 'asia'),
  ('iq', 'Iraq', 'Baghdad', 'asia'),
  ('il', 'Israel', 'Jerusalem', 'asia'),
  ('jp', 'Japan', 'Tokyo', 'asia'),
  ('jo', 'Jordan', 'Amman', 'asia'),
  ('kw', 'Kuwait', 'Kuwait City', 'asia'),
  ('kg', 'Kyrgyzstan', 'Bishkek', 'asia'),
  ('la', 'Laos', 'Vientiane', 'asia'),
  ('lb', 'Lebanon', 'Beirut', 'asia'),
  ('my', 'Malaysia', 'Kuala Lumpur', 'asia'),
  ('mv', 'Maldives', 'Male', 'asia'),
  ('mn', 'Mongolia', 'Ulaanbaatar', 'asia'),
  ('mm', 'Myanmar', 'Naypyidaw', 'asia'),
  ('np', 'Nepal', 'Kathmandu', 'asia'),
  ('kp', 'North Korea', 'Pyongyang', 'asia'),
  ('om', 'Oman', 'Muscat', 'asia'),
  ('pk', 'Pakistan', 'Islamabad', 'asia'),
  ('ps', 'Palestine', 'Ramallah', 'asia'),
  ('ph', 'Philippines', 'Manila', 'asia'),
  ('qa', 'Qatar', 'Doha', 'asia'),
  ('sa', 'Saudi Arabia', 'Riyadh', 'asia'),
  ('sg', 'Singapore', 'Singapore', 'asia'),
  ('kr', 'South Korea', 'Seoul', 'asia'),
  ('lk', 'Sri Lanka', 'Sri Jayawardenepura Kotte', 'asia'),
  ('sy', 'Syria', 'Damascus', 'asia'),
  ('tw', 'Taiwan', 'Taipei', 'asia'),
  ('tj', 'Tajikistan', 'Dushanbe', 'asia'),
  ('th', 'Thailand', 'Bangkok', 'asia'),
  ('tl', 'Timor-Leste', 'Dili', 'asia'),
  ('tm', 'Turkmenistan', 'Ashgabat', 'asia'),
  ('ae', 'United Arab Emirates', 'Abu Dhabi', 'asia'),
  ('uz', 'Uzbekistan', 'Tashkent', 'asia'),
  ('vn', 'Vietnam', 'Hanoi', 'asia'),
  ('ye', 'Yemen', 'Sana''a', 'asia'),
  ('au', 'Australia', 'Canberra', 'oceania'),
  ('fj', 'Fiji', 'Suva', 'oceania'),
  ('ki', 'Kiribati', 'South Tarawa', 'oceania'),
  ('mh', 'Marshall Islands', 'Majuro', 'oceania'),
  ('fm', 'Micronesia', 'Palikir', 'oceania'),
  ('nr', 'Nauru', 'Yaren', 'oceania'),
  ('nz', 'New Zealand', 'Wellington', 'oceania'),
  ('pw', 'Palau', 'Ngerulmud', 'oceania'),
  ('pg', 'Papua New Guinea', 'Port Moresby', 'oceania'),
  ('ws', 'Samoa', 'Apia', 'oceania'),
  ('sb', 'Solomon Islands', 'Honiara', 'oceania'),
  ('to', 'Tonga', 'Nukualofa', 'oceania'),
  ('tv', 'Tuvalu', 'Funafuti', 'oceania'),
  ('vu', 'Vanuatu', 'Port Vila', 'oceania')
on conflict (code) do update set
  name = excluded.name,
  capital = excluded.capital,
  region = excluded.region;

drop view if exists public.leaderboard;
create view public.leaderboard as
  select id, display_name, weekly_xp, week_start
  from public.profiles
  where weekly_xp > 0;

alter view public.leaderboard set (security_invoker = off);

grant select on public.leaderboard to authenticated;
revoke all on public.leaderboard from anon;
