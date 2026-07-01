"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle, ServiceCategory } from "@/lib/types";

export function VehicleFilter({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("vehicle") ?? "all";

  function set(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value === "all") p.delete("vehicle");
    else p.set("vehicle", value);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <Select value={current} onValueChange={set}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="ทุกคัน" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">รถทุกคัน</SelectItem>
        {vehicles.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            {v.brand} {v.model}
            {v.plate_no ? ` (${v.plate_no})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CategoryFilter({ categories }: { categories: ServiceCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("category") ?? "all";

  function set(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value === "all") p.delete("category");
    else p.set("category", value);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <Select value={current} onValueChange={set}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="ทุกหมวด" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">ทุกหมวด</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label_th}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
