# Deploy Guide — โฮมการาจ / Home Garage Manager

คู่มือติดตั้งแบบทีละขั้น สำหรับ Supabase + Vercel (ฟรีทั้งหมดในระดับ free tier)

---

## ส่วนที่ 1 — Supabase (ฐานข้อมูล + ที่เก็บไฟล์)

1. ไปที่ [supabase.com](https://supabase.com) → **New project**
   - ตั้งชื่อโปรเจกต์ + ตั้งรหัสผ่านฐานข้อมูล (จดไว้)
   - เลือก region ใกล้ไทยที่สุด เช่น **Southeast Asia (Singapore)**
2. เมื่อโปรเจกต์พร้อม เปิด **SQL Editor** → **New query**
3. คัดลอกเนื้อหาทั้งหมดจากไฟล์ [`../supabase/schema.sql`](../supabase/schema.sql) ไปวาง แล้วกด **Run**
   - สคริปต์จะสร้างตาราง, enum, index, view `expense_summary`, seed หมวดบริการ และเปิด RLS พร้อม policy แบบอนุญาตทั้งหมด
4. สร้าง Storage bucket
   - เมนู **Storage** → **New bucket** → ชื่อ `attachments` → ติ๊ก **Public bucket** → Create
   - (ทางเลือก) เปิด policy การอัปโหลด: SQL ตัวอย่างอยู่ท้ายไฟล์ `schema.sql` (คอมเมนต์ไว้)
5. คัดลอกคีย์: เมนู **Settings → API**
   - `Project URL` → ใช้เป็น `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → ใช้เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → ใช้เป็น `SUPABASE_SERVICE_ROLE_KEY`

---

## ส่วนที่ 2 — Vercel (โฮสต์เว็บ)

โปรเจกต์นี้ถูก push ขึ้น GitHub และ deploy บน Vercel แล้วด้วย **placeholder envs** เพื่อให้ build ผ่าน
คุณเพียงแค่แทนที่ค่า env แล้ว redeploy:

1. ไปที่ [vercel.com](https://vercel.com) → เลือกโปรเจกต์ **home-garage-manager**
2. **Settings → Environment Variables** → แก้ไข/แทนที่ 4 ตัวแปร (Environment = Production):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL จาก Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `RESEND_API_KEY` | (ทางเลือก) คีย์ Resend สำหรับอีเมล — เว้นว่างได้ |

3. ไปที่แท็บ **Deployments** → เมนู `...` ของ deployment ล่าสุด → **Redeploy**
4. เปิด URL production → ควรเห็นแดชบอร์ดพร้อมข้อมูล (เริ่มต้นจะว่าง ให้กด "เพิ่มรถ")

> ตรวจสอบสถานะการเชื่อมต่อได้ที่หน้า **ตั้งค่า (Settings)** ในแอป — จะแสดงว่า env ตัวไหนตั้งค่าแล้ว/ยัง

---

## รันในเครื่อง (Local development)

```bash
cp .env.example .env.local   # แล้วเติมค่าจริงจาก Supabase
npm install
npm run dev                  # http://localhost:3000
```

## ตรวจคุณภาพก่อน deploy

```bash
npx tsc --noEmit   # ตรวจ type
npm run lint       # ตรวจ lint
npm run build      # build production
```

## หมายเหตุ free tier

- **Supabase Free:** ฐานข้อมูล 500 MB, Storage 1 GB, มี pause หากไม่มี activity 7 วัน (เข้าใช้แล้วกลับมาทำงาน)
- **Vercel Hobby:** ฟรีสำหรับใช้ส่วนตัว/ไม่เชิงพาณิชย์ — เพียงพอสำหรับแอปครัวเรือน
