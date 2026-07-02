-- ============================================================
-- Phase 5 Migration Script — Home Garage Manager
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Update RLS Policy for attachments to support 'renewal' entity_type
-- ============================================================
drop policy if exists "Users can manage attachments for their own vehicles" on attachments;

create policy "Users can manage attachments for their own vehicles" on attachments
  for all to authenticated
  using (
    (entity_type = 'vehicle' and exists (select 1 from vehicles where vehicles.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'service_event' and exists (select 1 from service_events join vehicles on vehicles.id = service_events.vehicle_id where service_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'repair_event' and exists (select 1 from repair_events join vehicles on vehicles.id = repair_events.vehicle_id where repair_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'renewal' and exists (select 1 from renewals join vehicles on vehicles.id = renewals.vehicle_id where renewals.id = entity_id and vehicles.user_id = auth.uid()))
  )
  with check (
    (entity_type = 'vehicle' and exists (select 1 from vehicles where vehicles.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'service_event' and exists (select 1 from service_events join vehicles on vehicles.id = service_events.vehicle_id where service_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'repair_event' and exists (select 1 from repair_events join vehicles on vehicles.id = repair_events.vehicle_id where repair_events.id = entity_id and vehicles.user_id = auth.uid()))
    or
    (entity_type = 'renewal' and exists (select 1 from renewals join vehicles on vehicles.id = renewals.vehicle_id where renewals.id = entity_id and vehicles.user_id = auth.uid()))
  );
