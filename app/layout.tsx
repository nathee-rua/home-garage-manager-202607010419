import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileTopBar } from "@/components/MobileTopBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "โฮมการาจ — Home Garage Manager",
  description:
    "ระบบจัดการการดูแลรักษารถยนต์ในครัวเรือน · Household vehicle maintenance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body className="font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileTopBar />
              <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
                <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
              </main>
            </div>
          </div>
          <BottomNav />
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
