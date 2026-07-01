# 🚗 โฮมการาจ · Home Garage Manager

> ระบบจัดการการดูแลรักษารถยนต์ในครัวเรือน — บันทึกการบำรุงรักษา, การซ่อม, ต่ออายุ (ประกัน/พ.ร.บ./ภาษี/ตรวจสภาพ), ค่าใช้จ่าย และเอกสารแนบ พร้อมระบบเตือนอัตโนมัติตามระยะทางและเวลา
>
> A bilingual (Thai-first) household vehicle maintenance tracker. Log services, repairs, renewals, expenses, and documents — with automatic due reminders by mileage and time.

---

## ✨ ฟีเจอร์ / Features

- **แดชบอร์ด** — สรุปรถทั้งหมด, จำนวนเกินกำหนด/ใกล้ถึงกำหนด/ครบเดือนนี้ และตารางรายการเตือนเรียงตามความเร่งด่วน พร้อมป้ายสี (เขียว/เหลือง/แดง)
- **จัดการรถ** — เพิ่ม/ดูรายละเอียดรถ พร้อมแท็บ ภาพรวม · บำรุงรักษา · ซ่อม · ต่ออายุ · ค่าใช้จ่าย · เอกสารแนบ
- **กฎการบำรุงรักษา (Service rules)** — ตั้งระยะเปลี่ยนถ่ายต่อหมวด เช่น น้ำมันเครื่องทุก 10,000 กม. หรือ 6 เดือน → ระบบคำนวณกำหนดครั้งถัดไปให้อัตโนมัติ
- **บันทึกการบำรุงรักษา & การซ่อม** — พร้อมค่าอะไหล่/ค่าแรง/อื่นๆ และผูกกับร้าน/ศูนย์บริการ
- **ต่ออายุ** — ประกันภัย, พ.ร.บ., ภาษีรถยนต์, ตรวจสภาพ พร้อมสถานะครบกำหนด
- **สรุปค่าใช้จ่าย** — ตามรถ / ตามหมวด / ตามเดือน + ปุ่ม **ส่งออก CSV** (รองรับภาษาไทยใน Excel)
- **ทำเนียบร้าน/ศูนย์บริการ** — CRUD (ศูนย์บริการ, B-Quik, Cockpit, อู่อิสระ, ร้านยาง ฯลฯ)
- **เอกสารแนบ** — อัปโหลดใบเสร็จ/รูปเข้า Supabase Storage
- **บันทึกด่วน (Quick add)** — Sheet ด้านขวาพร้อมแท็บ บริการ / ซ่อม / ต่ออายุ
- **UI ไทยเป็นหลัก** + English รอง, mobile-first, sidebar สำหรับ desktop และ bottom nav สำหรับมือถือ

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) + **lucide-react**
- **Supabase** — PostgreSQL + Storage
- **Vercel** — hosting
- Mutations ทั้งหมดผ่าน **Server Actions**; การอ่านใช้ **Server Components**
- ไม่มีระบบล็อกอินใน v1 (single household, RLS แบบอนุญาตทั้งหมด)

## 🚀 เริ่มต้นใช้งานในเครื่อง / Local setup

```bash
git clone <repo-url>
cd home-garage-manager
cp .env.example .env.local     # เติมค่าจริงจาก Supabase (ดูด้านล่าง)
npm install
npm run dev                    # เปิด http://localhost:3000
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=      # Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # anon public key
SUPABASE_SERVICE_ROLE_KEY=     # service_role key (server actions)
RESEND_API_KEY=                # (ตัวเลือก) สำหรับอีเมลแจ้งเตือน v2
```

> แอปออกแบบให้ **build ผ่านแม้ env ว่าง** — Supabase client ถูก init แบบ lazy และอ่าน env ตอน request ไม่ใช่ตอน module load ดังนั้น `next build` จะไม่ crash ด้วย placeholder envs หากยังไม่ตั้งค่า แอปจะทำงานในโหมดตัวอย่าง (ข้อมูลว่าง) และแสดงแบนเนอร์เตือน

## 🗄️ ตั้งค่า Supabase (migration)

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. เปิด **SQL Editor → New query** → วางเนื้อหาจาก [`supabase/schema.sql`](supabase/schema.sql) → **Run**
3. สร้าง **Storage bucket** ชื่อ `attachments` (public)
4. คัดลอก URL + anon key + service role key จาก **Settings → API**

รายละเอียดแบบทีละขั้น: ดู [`docs/DEPLOY.md`](docs/DEPLOY.md)

## ☁️ Deploy บน Vercel

1. Import repo เข้า Vercel (หรือใช้ที่ deploy ไว้แล้ว)
2. ตั้งค่า Environment Variables 4 ตัวข้างต้น (Production)
3. Redeploy

## 📚 เอกสารเพิ่มเติม

- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — ตารางข้อมูลและความสัมพันธ์
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — คู่มือ deploy ทีละขั้น

## 🖼️ ภาพหน้าจอ / Screenshots

<!-- Screenshots placeholder — เพิ่มรูปหน้าจอที่นี่ -->
_เพิ่มภาพหน้าจอแดชบอร์ด, หน้ารถ และหน้าค่าใช้จ่ายที่นี่_

## 🧭 การตัดสินใจด้านออกแบบ / Design decisions

- **ไม่มี auth ใน v1** — ออกแบบสำหรับครัวเรือนเดียว ลดความซับซ้อน เริ่มใช้ได้ทันที; RLS เปิดไว้พร้อม policy อนุญาตทั้งหมด เพื่อให้ต่อยอด auth ได้ง่ายในอนาคต
- **Service role key ฝั่ง server** — ใช้ใน Server Actions/Components เพื่อความเรียบง่าย (ปลอดภัยเพราะไม่หลุดไปฝั่ง client)
- **คำนวณ due แบบ two-dimensional** — พิจารณาทั้งเวลา (เดือน) และระยะทาง (กม.) อันไหนถึงก่อนถือว่าถึงกำหนด
- **สรุปค่าใช้จ่ายระดับแอป** — รวมทั้ง service + repair; view `expense_summary` ใน DB สำหรับ query ภายนอก
- **ธีมสี** — โทน slate เข้ม (ความแม่นยำแบบเครื่องกล) + accent อำพัน (บรรยากาศการาจ)

## 🔭 แผนต่อยอด / Roadmap (v2+)

- ระบบล็อกอิน + RLS ตามผู้ใช้/ครัวเรือน
- Cron job ส่งอีเมลแจ้งเตือนรายวันผ่าน Resend
- แก้ไข (edit) รายการที่บันทึกไว้ (ปัจจุบันรองรับเพิ่ม/ลบ)
- planned_jobs UI, กราฟค่าใช้จ่าย, export PDF

## 📄 License

ใช้งานส่วนตัวในครัวเรือน (Personal / household use).
