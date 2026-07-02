-- =============================================================================
-- Home Garage Manager — Supabase schema
-- ระบบจัดการการดูแลรักษารถยนต์ในครัวเรือน
-- Run this whole file in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- v1: single household, no auth. RLS is enabled but permissive for the anon role.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type fuel_type as enum ('gasoline', 'hybrid', 'phev', 'ev');
exception when duplicate_object then null; end $$;

do $$ begin
  create type renewal_type as enum ('insurance', 'compulsory_insurance', 'road_tax', 'inspection', 'annual_pass', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type renewal_status as enum ('upcoming', 'done', 'overdue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type repair_urgency as enum ('emergency', 'planned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type provider_type as enum ('dealer', 'bquik', 'cockpit', 'independent', 'tire_shop', 'battery_shop', 'other');
exception when duplicate_object then null; end $$;

-- Tables ----------------------------------------------------------------------
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type provider_type not null default 'other',
  branch text,
  phone text,
  line_contact text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year int,
  plate_no text,
  vin text,
  fuel_type fuel_type not null default 'gasoline',
  odometer int not null default 0,
  odometer_unit text not null default 'km',
  purchase_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  category text not null,
  interval_km int,
  interval_months int,
  created_at timestamptz not null default now()
);

create table if not exists service_events (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  date date not null default current_date,
  odometer int,
  category text not null,
  details text,
  provider_id uuid references providers(id) on delete set null,
  cost_parts numeric(12,2) not null default 0,
  cost_labor numeric(12,2) not null default 0,
  cost_misc numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists repair_events (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  date date not null default current_date,
  symptom text,
  diagnosis text,
  action_taken text,
  parts_used text,
  provider_id uuid references providers(id) on delete set null,
  total_cost numeric(12,2) not null default 0,
  urgency repair_urgency not null default 'planned',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists renewals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  type renewal_type not null default 'other',
  due_date date not null,
  cost_estimate numeric(12,2) not null default 0,
  status renewal_status not null default 'upcoming',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists planned_jobs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  title text not null,
  target_date date,
  target_odometer int,
  priority job_priority not null default 'medium',
  criticality text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  file_url text not null,
  file_name text,
  file_type text,
  captured_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

-- Reference: service categories -----------------------------------------------
create table if not exists service_categories (
  code text primary key,
  label_th text not null,
  label_en text not null,
  ev_relevant boolean not null default true
);

insert into service_categories (code, label_th, label_en, ev_relevant) values
  ('engine_oil',      'น้ำมันเครื่อง',         'Engine Oil',        false),
  ('air_filter',      'กรองอากาศ',            'Air Filter',        false),
  ('cabin_filter',    'กรองแอร์',              'Cabin Filter',      true),
  ('tires',           'ยาง',                   'Tires',             true),
  ('brakes',          'เบรก',                  'Brakes',            true),
  ('battery',         'แบตเตอรี่',             'Battery',           true),
  ('brake_fluid',     'น้ำมันเบรก',            'Brake Fluid',       true),
  ('coolant',         'น้ำหล่อเย็น',           'Coolant',           true),
  ('spark_plugs',     'หัวเทียน',              'Spark Plugs',       false),
  ('transmission',    'ระบบเกียร์',            'Transmission',      false),
  ('wipers',          'ใบปัดน้ำฝน',            'Wipers',            true),
  ('ev_battery_check','ตรวจแบตเตอรี่ EV',      'EV Battery Check',  true),
  ('tire_rotation',   'สลับยาง',               'Tire Rotation',     true)
on conflict (code) do nothing;

-- Indexes ---------------------------------------------------------------------
create index if not exists idx_service_events_vehicle on service_events(vehicle_id);
create index if not exists idx_service_events_date on service_events(date);
create index if not exists idx_repair_events_vehicle on repair_events(vehicle_id);
create index if not exists idx_renewals_vehicle on renewals(vehicle_id);
create index if not exists idx_renewals_due on renewals(due_date);
create index if not exists idx_service_rules_vehicle on service_rules(vehicle_id);
create index if not exists idx_planned_jobs_vehicle on planned_jobs(vehicle_id);
create index if not exists idx_attachments_entity on attachments(entity_type, entity_id);

-- updated_at trigger for vehicles ---------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vehicles_updated_at on vehicles;
create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

-- Expense summary view --------------------------------------------------------
-- Aggregate service-event spend per vehicle per month.
create or replace view expense_summary as
select
  vehicle_id,
  date_trunc('month', date)::date as month,
  sum(coalesce(cost_parts, 0) + coalesce(cost_labor, 0) + coalesce(cost_misc, 0)) as total_cost
from service_events
group by vehicle_id, date_trunc('month', date);

-- =============================================================================
-- Row Level Security — Secure Auth-based policies
-- =============================================================================
-- Add user_id column to core tables
alter table vehicles add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table providers add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Enable RLS
alter table vehicles           enable row level security;
alter table service_rules      enable row level security;
alter table service_events     enable row level security;
alter table repair_events      enable row level security;
alter table renewals           enable row level security;
alter table planned_jobs       enable row level security;
alter table providers          enable row level security;
alter table attachments        enable row level security;
alter table service_categories enable row level security;

-- Drop old permissive policies
do $$
declare t text;
begin
  foreach t in array array[
    'vehicles','service_rules','service_events','repair_events',
    'renewals','planned_jobs','providers','attachments','service_categories'
  ]
  loop
    execute format('drop policy if exists %I on %I;', 'allow_all_' || t, t);
  end loop;
end $$;

-- 1. Vehicles Policy
drop policy if exists "Users can manage their own vehicles" on vehicles;
create policy "Users can manage their own vehicles" on vehicles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Providers Policy
drop policy if exists "Users can manage their own providers" on providers;
create policy "Users can manage their own providers" on providers
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 3. Service Rules Policy
drop policy if exists "Users can manage service rules for their own vehicles" on service_rules;
create policy "Users can manage service rules for their own vehicles" on service_rules
  for all to authenticated
  using (exists (select 1 from vehicles where vehicles.id = service_rules.vehicle_id and vehicles.user_id = auth.uid()))
  with check (exists (select 1 from vehicles where vehicles.id = service_rules.vehicle_id and vehicles.user_id = auth.uid()));

-- 4. Service Events Policy
drop policy if exists "Users can manage service events for their own vehicles" on service_events;
create policy "Users can manage service events for their own vehicles" on service_events
  for all to authenticated
  using (exists (select 1 from vehicles where vehicles.id = service_events.vehicle_id and vehicles.user_id = auth.uid()))
  with check (exists (select 1 from vehicles where vehicles.id = service_events.vehicle_id and vehicles.user_id = auth.uid()));

-- 5. Repair Events Policy
drop policy if exists "Users can manage repair events for their own vehicles" on repair_events;
create policy "Users can manage repair events for their own vehicles" on repair_events
  for all to authenticated
  using (exists (select 1 from vehicles where vehicles.id = repair_events.vehicle_id and vehicles.user_id = auth.uid()))
  with check (exists (select 1 from vehicles where vehicles.id = repair_events.vehicle_id and vehicles.user_id = auth.uid()));

-- 6. Renewals Policy
drop policy if exists "Users can manage renewals for their own vehicles" on renewals;
create policy "Users can manage renewals for their own vehicles" on renewals
  for all to authenticated
  using (exists (select 1 from vehicles where vehicles.id = renewals.vehicle_id and vehicles.user_id = auth.uid()))
  with check (exists (select 1 from vehicles where vehicles.id = renewals.vehicle_id and vehicles.user_id = auth.uid()));

-- 7. Planned Jobs Policy
drop policy if exists "Users can manage planned jobs for their own vehicles" on planned_jobs;
create policy "Users can manage planned jobs for their own vehicles" on planned_jobs
  for all to authenticated
  using (exists (select 1 from vehicles where vehicles.id = planned_jobs.vehicle_id and vehicles.user_id = auth.uid()))
  with check (exists (select 1 from vehicles where vehicles.id = planned_jobs.vehicle_id and vehicles.user_id = auth.uid()));

-- 8. Attachments Policy
drop policy if exists "Users can manage attachments for their own vehicles" on attachments;
create policy "Users can manage attachments for their own vehicles" on attachments
  for all to authenticated
  using (
    (entity_type = 'vehicle' and exists (select 1 from vehicles where vehicles.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'service_event' and exists (select 1 from service_events join vehicles on vehicles.id = service_events.vehicle_id where service_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'repair_event' and exists (select 1 from repair_events join vehicles on vehicles.id = repair_events.vehicle_id where repair_events.id = entity_id and vehicles.user_id = auth.uid()))
  )
  with check (
    (entity_type = 'vehicle' and exists (select 1 from vehicles where vehicles.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'service_event' and exists (select 1 from service_events join vehicles on vehicles.id = service_events.vehicle_id where service_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'repair_event' and exists (select 1 from repair_events join vehicles on vehicles.id = repair_events.vehicle_id where repair_events.id = entity_id and vehicles.user_id = auth.uid()))
  );

-- 9. Service Categories Policy (Read-only for all public users)
drop policy if exists "Allow read access to service categories for everyone" on service_categories;
create policy "Allow read access to service categories for everyone" on service_categories
  for select to public
  using (true);

-- =============================================================================
-- Storage bucket for attachments (create in Dashboard → Storage, name: attachments)
-- Then apply a permissive storage policy for anon uploads/reads:
-- (Run after creating the bucket named "attachments")
-- =============================================================================
-- insert into storage.buckets (id, name, public) values ('attachments','attachments', true)
--   on conflict (id) do nothing;
-- create policy "attachments anon all" on storage.objects
--   for all to anon, authenticated
--   using (bucket_id = 'attachments') with check (bucket_id = 'attachments');
