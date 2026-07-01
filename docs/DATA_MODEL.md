# Data Model — โฮมการาจ / Home Garage Manager

ข้อมูลทั้งหมดจัดเก็บใน Supabase (PostgreSQL) สคีมาอยู่ในไฟล์ [`../supabase/schema.sql`](../supabase/schema.sql)

## Entities / ตารางข้อมูล

| Table | คำอธิบาย (TH) | Description (EN) |
| --- | --- | --- |
| `vehicles` | รถแต่ละคันในครัวเรือน | Each household vehicle |
| `service_rules` | กฎการบำรุงรักษาต่อรถ (ทุกกี่ กม./เดือน) | Per-vehicle maintenance intervals |
| `service_events` | บันทึกการบำรุงรักษาที่ทำจริง + ค่าใช้จ่าย | Actual maintenance log entries + cost |
| `repair_events` | บันทึกการซ่อม (อาการ/วินิจฉัย/แก้ไข) | Repair records |
| `renewals` | ต่ออายุ: ประกัน, พ.ร.บ., ภาษี, ตรวจสภาพ | Insurance / compulsory / tax / inspection |
| `planned_jobs` | งานที่วางแผนไว้ล่วงหน้า | Planned future jobs |
| `providers` | ทำเนียบร้าน/ศูนย์บริการ | Service provider directory |
| `attachments` | ไฟล์แนบ (ใบเสร็จ/รูป) ผูกกับ entity ใดก็ได้ | Polymorphic file attachments |
| `service_categories` | รายการหมวดอ้างอิง (seed) + ธง `ev_relevant` | Reference list of service categories |

## Relationships / ความสัมพันธ์

```
vehicles (1) ──< service_rules   (many)
vehicles (1) ──< service_events  (many)
vehicles (1) ──< repair_events   (many)
vehicles (1) ──< renewals        (many)
vehicles (1) ──< planned_jobs    (many)

providers (1) ──< service_events (many, nullable provider_id)
providers (1) ──< repair_events  (many, nullable provider_id)

attachments.entity_type + entity_id  →  polymorphic (e.g. 'vehicle' + vehicles.id)
```

- การลบรถ (`vehicles`) จะ cascade ลบ service_rules / service_events / repair_events / renewals / planned_jobs ของรถคันนั้น
- การลบ provider จะ `SET NULL` บน service_events / repair_events (ไม่ลบบันทึก)

## Enums

| Enum | Values |
| --- | --- |
| `fuel_type` | `gasoline`, `hybrid`, `phev`, `ev` |
| `renewal_type` | `insurance`, `compulsory_insurance`, `road_tax`, `inspection`, `annual_pass`, `other` |
| `renewal_status` | `upcoming`, `done`, `overdue` |
| `repair_urgency` | `emergency`, `planned` |
| `job_priority` | `low`, `medium`, `high` |
| `provider_type` | `dealer`, `bquik`, `cockpit`, `independent`, `tire_shop`, `battery_shop`, `other` |

## View: `expense_summary`

สรุปค่าใช้จ่ายจาก `service_events` ต่อรถต่อเดือน:

```sql
SELECT vehicle_id, DATE_TRUNC('month', date) AS month,
       SUM(cost_parts + cost_labor + cost_misc) AS total_cost
FROM service_events
GROUP BY vehicle_id, DATE_TRUNC('month', date);
```

> หมายเหตุ: หน้า `/expenses` ในแอปคำนวณสรุปเพิ่มเติม (รวมค่าซ่อมด้วย) ในระดับแอปพลิเคชัน เพื่อความยืดหยุ่น view นี้มีไว้สำหรับ query โดยตรง/รายงานภายนอก

## Due engine / ตรรกะการคำนวณกำหนด

อยู่ใน [`../lib/dueEngine.ts`](../lib/dueEngine.ts)

- `computeNextDue({ lastDate, lastOdometer, intervalMonths, intervalKm })` → `{ nextDueDate, nextDueOdometer }`
- `computeStatus({ nextDueDate, nextDueOdometer, currentOdometer, today })` → `'normal' | 'due_soon' | 'overdue'`
  - **overdue (แดง):** เลยวันครบกำหนด หรือเลขไมล์เกินเป้าหมาย
  - **due_soon (เหลือง):** เหลือ ≤ 14 วัน **หรือ** ≤ 500 กม.
  - **normal (เขียว):** นอกเหนือจากนั้น

## Security / RLS

v1 ไม่มีระบบล็อกอิน (single household) — เปิด RLS ทุกตาราง แต่ใช้ policy แบบอนุญาตทั้งหมด
`USING (true) WITH CHECK (true)` สำหรับ role `anon` และ `authenticated`
เมื่อเพิ่ม auth ในอนาคต ให้แก้ policy เหล่านี้ให้จำกัดตามผู้ใช้
