"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const sb = getServerClient();
  if (!sb) {
    return { error: "ระบบฐานข้อมูลไม่ได้ตั้งค่า" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน" };
  }

  // Strip all standard and unicode whitespaces, zero-width spaces, and invisible characters
  const cleanUsername = username
    .replace(/[\s\u00a0\u200b\u200c\u200d\uFEFF]/g, "")
    .toLowerCase();

  const email = `${cleanUsername}@garage.local`;

  const { error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "กรุณาปิด 'Confirm email' ในเมนู Auth -> Providers -> Email ของ Supabase ก่อนเพื่อเข้าสู่ระบบด้วย Username" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const sb = getServerClient();
  if (!sb) {
    return { error: "ระบบฐานข้อมูลไม่ได้ตั้งค่า" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน" };
  }

  // Strip all standard and unicode whitespaces, zero-width spaces, and invisible characters
  const cleanUsername = username
    .replace(/[\s\u00a0\u200b\u200c\u200d\uFEFF]/g, "")
    .toLowerCase();

  console.log("DEBUG SIGNUP - Original:", JSON.stringify(username), "Cleaned:", JSON.stringify(cleanUsername), "Regex Match:", /^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername));
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
    return { error: "ชื่อผู้ใช้งานต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ ความยาว 3-20 ตัวอักษร" };
  }

  const email = `${cleanUsername}@garage.local`;

  const { error, data } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "ชื่อผู้ใช้งานนี้ถูกใช้งานไปแล้ว" };
    }
    return { error: error.message };
  }

  if (data?.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    success:
      "สมัครสมาชิกสำเร็จ! โปรดลองเข้าสู่ระบบด้วยชื่อผู้ใช้งานของคุณ (โปรดปิด 'Confirm email' ใน Supabase Dashboard แล้ว)",
  };
}

export async function logout() {
  const sb = getServerClient();
  if (sb) {
    await sb.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
