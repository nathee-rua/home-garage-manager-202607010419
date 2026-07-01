import { Logo } from "@/components/Logo";

export function MobileTopBar() {
  return (
    <header className="flex h-14 items-center gap-2.5 border-b bg-card px-4 md:hidden">
      <Logo className="h-6 w-6 text-primary" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">โฮมการาจ</p>
      </div>
    </header>
  );
}
