-- ============================================================
-- Phase 4 Migration Script — Home Garage Manager
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create user_settings table
-- ============================================================
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  telegram_chat_id text,
  telegram_enabled boolean default false,
  email_enabled boolean default true,
  notify_days_before int default 7,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_settings enable row level security;

-- 2. Setup RLS Policies for user_settings
-- ============================================================
drop policy if exists "Users can view own settings" on user_settings;
drop policy if exists "Users can insert own settings" on user_settings;
drop policy if exists "Users can update own settings" on user_settings;
drop policy if exists "Users can delete own settings" on user_settings;

create policy "Users can view own settings"
  on user_settings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on user_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own settings"
  on user_settings for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- End of Phase 4 Migration
-- ============================================================
