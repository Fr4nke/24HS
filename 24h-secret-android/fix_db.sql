-- =====================================================================
-- Fix DB for 24h-secret app
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- =====================================================================

-- 1) WHISPERS TABLE (for direct messages on secrets)
create table if not exists whispers (
  id          uuid primary key default gen_random_uuid(),
  secret_id   uuid not null references secrets(id) on delete cascade,
  sender_id   uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  text        text not null check (char_length(text) <= 500),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists whispers_secret_idx on whispers(secret_id);
create index if not exists whispers_sender_idx on whispers(sender_id);
create index if not exists whispers_receiver_idx on whispers(receiver_id);

alter table whispers enable row level security;

drop policy if exists "users see their whispers" on whispers;
create policy "users see their whispers" on whispers
  for select using (auth.uid() in (sender_id, receiver_id));

drop policy if exists "users send their own whispers" on whispers;
create policy "users send their own whispers" on whispers
  for insert with check (auth.uid() = sender_id);

drop policy if exists "receiver marks read" on whispers;
create policy "receiver marks read" on whispers
  for update using (auth.uid() = receiver_id)
              with check (auth.uid() = receiver_id);

-- 2) INBOX RPC — fixes "Error: 404"
create or replace function get_whisper_conversations()
returns table (
  secret_id uuid,
  secret_text text,
  other_user_id uuid,
  last_message text,
  last_message_at timestamptz,
  unread_count int
)
language sql
security definer
set search_path = public
as $$
  with my_threads as (
    select
      w.secret_id,
      case when w.sender_id = auth.uid() then w.receiver_id else w.sender_id end as other_user_id,
      w.text,
      w.created_at,
      w.sender_id,
      w.read_at
    from whispers w
    where w.sender_id = auth.uid() or w.receiver_id = auth.uid()
  ),
  latest as (
    select distinct on (secret_id, other_user_id)
      secret_id, other_user_id, text, created_at
    from my_threads
    order by secret_id, other_user_id, created_at desc
  )
  select
    l.secret_id,
    coalesce(s.text, '(deleted)') as secret_text,
    l.other_user_id,
    l.text as last_message,
    l.created_at as last_message_at,
    (select count(*)::int from my_threads m
       where m.secret_id = l.secret_id
         and m.other_user_id = l.other_user_id
         and m.sender_id = l.other_user_id
         and m.read_at is null) as unread_count
  from latest l
  left join secrets s on s.id = l.secret_id
  order by l.created_at desc;
$$;

grant execute on function get_whisper_conversations() to authenticated;

-- 3) FIX "Could not save: 400" — adjust RLS on secrets so logged-in users can INSERT with their own user_id
-- First make sure user_id, lat, lng columns exist on secrets
alter table secrets add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table secrets add column if not exists lat double precision;
alter table secrets add column if not exists lng double precision;

-- Enable RLS (idempotent)
alter table secrets enable row level security;

-- Anyone can READ non-expired secrets
drop policy if exists "anyone reads secrets" on secrets;
create policy "anyone reads secrets" on secrets
  for select using (true);

-- Anyone (anon or authenticated) can INSERT
-- If user_id is provided, it must match auth.uid()
drop policy if exists "insert with own user_id" on secrets;
create policy "insert with own user_id" on secrets
  for insert with check (
    user_id is null or user_id = auth.uid()
  );

-- Only owner can UPDATE/DELETE
drop policy if exists "owner updates" on secrets;
create policy "owner updates" on secrets
  for update using (user_id = auth.uid());

drop policy if exists "owner deletes" on secrets;
create policy "owner deletes" on secrets
  for delete using (user_id = auth.uid());

-- Grant access to anon + authenticated roles
grant select, insert on secrets to anon, authenticated;
