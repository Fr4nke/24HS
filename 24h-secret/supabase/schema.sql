-- Run this in Supabase SQL editor

create table secrets (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 5 and 280),
  mood text check (mood in ('lettelse', 'skam', 'stolthet', 'anger', 'annet')),
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '24 hours',
  reaction_me_too int default 0,
  reaction_heart int default 0
);

create index on secrets (expires_at);
create index on secrets (reaction_me_too desc);

alter table secrets enable row level security;
create policy "read all" on secrets for select using (expires_at > now());
create policy "insert all" on secrets for insert with check (true);

-- Atomic increment function
create or replace function increment_reaction(secret_id uuid, col_name text)
returns void language plpgsql as $$
begin
  if col_name = 'reaction_me_too' then
    update secrets set reaction_me_too = reaction_me_too + 1 where id = secret_id;
  elsif col_name = 'reaction_heart' then
    update secrets set reaction_heart = reaction_heart + 1 where id = secret_id;
  end if;
end;
$$;

-- Step 1: Enable pg_cron in Database → Extensions
-- Step 2: Run this to auto-delete expired secrets every 15 min:
-- select cron.schedule(
--   'delete-expired-secrets',
--   '*/15 * * * *',
--   $$ delete from secrets where expires_at < now() $$
-- );
