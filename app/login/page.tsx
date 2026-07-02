"use client";

import { useState } from "react";
import { Wrench, User, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login, signup } from "./actions";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    try {
      if (isLogin) {
        const res = await login(formData);
        if (res?.error) {
          setError(res.error);
        }
      } else {
        const res = await signup(formData);
        if (res?.error) {
          setError(res.error);
        } else if (res?.success) {
          setSuccess(res.success);
          e.currentTarget.reset();
        }
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Home Garage Manager
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ระบบจัดการและบันทึกการดูแลรักษารถยนต์ในครัวเรือน
          </p>
        </div>

        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีของคุณ"
                : "สร้างบัญชีใหม่เพื่อเริ่มต้นจัดการรถยนต์ในบ้านของคุณ"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้งาน / Username</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="เช่น nathee"
                    required
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน / Password</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "ยังไม่มีบัญชีใช่หรือไม่? " : "มีบัญชีอยู่แล้ว? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-medium text-primary hover:underline"
                  disabled={loading}
                >
                  {isLogin ? "สมัครสมาชิกใหม่" : "เข้าสู่ระบบที่นี่"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
