-- ============================================================
-- Phase 2 Migration Script — Home Garage Manager
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create fuel_types table
-- ============================================================
create table if not exists fuel_types (
  code text primary key,
  label_th text not null,
  label_en text not null,
  sort_order int not null default 0
);
alter table fuel_types enable row level security;

-- 2. Seed fuel_types
-- ============================================================
insert into fuel_types (code, label_th, label_en, sort_order)
values
  ('gasoline', 'น้ำมันเบนซิน', 'Gasoline', 1),
  ('diesel',   'ดีเซล',         'Diesel',   2),
  ('hybrid',   'ไฮบริด',        'Hybrid',   3),
  ('phev',     'ปลั๊กอินไฮบริด', 'PHEV',     4),
  ('ev',       'ไฟฟ้า',         'EV',       5)
on conflict (code) do nothing;

-- 3. Change vehicles.fuel_type from enum to text
-- ============================================================
alter table vehicles alter column fuel_type type text using fuel_type::text;
alter table vehicles alter column fuel_type set default 'gasoline';
drop type if exists fuel_type;

-- 4. Add new columns to service_categories
-- ============================================================
alter table service_categories add column if not exists default_interval_km int;
alter table service_categories add column if not exists default_interval_months int;
alter table service_categories add column if not exists is_user_defined boolean not null default false;
alter table service_categories add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 5. Insert new 'standard_service' category
-- ============================================================
insert into service_categories (code, label_th, label_en, ev_relevant, default_interval_km, default_interval_months)
values ('standard_service', 'เช็กระยะมาตรฐาน', 'Standard Service', true, 10000, 6)
on conflict (code) do nothing;

-- 6. Update existing categories with default intervals
-- ============================================================
update service_categories set default_interval_km = 10000, default_interval_months = 6
  where code = 'engine_oil';

update service_categories set default_interval_km = 20000, default_interval_months = 12
  where code = 'air_filter';

update service_categories set default_interval_km = 15000, default_interval_months = 12
  where code = 'cabin_filter';

update service_categories set default_interval_km = 40000, default_interval_months = 36
  where code = 'tires';

update service_categories set default_interval_km = 40000, default_interval_months = 24
  where code = 'brakes';

update service_categories set default_interval_km = null,  default_interval_months = 36
  where code = 'battery';

update service_categories set default_interval_km = null,  default_interval_months = 24
  where code = 'brake_fluid';

update service_categories set default_interval_km = 40000, default_interval_months = 24
  where code = 'coolant';

update service_categories set default_interval_km = 40000, default_interval_months = 24
  where code = 'spark_plugs';

update service_categories set default_interval_km = 40000, default_interval_months = 24
  where code = 'transmission';

update service_categories set default_interval_km = null,  default_interval_months = 6
  where code = 'wipers';

update service_categories set default_interval_km = 10000, default_interval_months = 6
  where code = 'tire_rotation';

-- 7. RLS policies for fuel_types
-- ============================================================
create policy "Anyone authenticated can view fuel types"
  on fuel_types for select
  to authenticated
  using (true);

create policy "Anyone authenticated can manage fuel types"
  on fuel_types for all
  to authenticated
  using (true)
  with check (true);

-- 8. RLS policy for user-defined service_categories
-- ============================================================
-- Allow authenticated users to insert their own user-defined categories
create policy "Authenticated users can insert user-defined categories"
  on service_categories for insert
  to authenticated
  with check (is_user_defined = true);

-- Allow authenticated users to update their own user-defined categories
create policy "Authenticated users can update user-defined categories"
  on service_categories for update
  to authenticated
  using (is_user_defined = true)
  with check (is_user_defined = true);

-- Allow authenticated users to delete their own user-defined categories
create policy "Authenticated users can delete user-defined categories"
  on service_categories for delete
  to authenticated
  using (is_user_defined = true);

-- ============================================================
-- End of Phase 2 Migration
-- ============================================================
