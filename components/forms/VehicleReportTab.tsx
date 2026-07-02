"use client";

import { useState } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { exportHistoryToCSV } from "@/lib/csvExporter";
import type { Vehicle, ServiceEvent, RepairEvent, Renewal, Provider, ServiceCategory } from "@/lib/types";

interface VehicleReportTabProps {
  vehicle: Vehicle;
  services: ServiceEvent[];
  repairs: RepairEvent[];
  renewals: Renewal[];
  providers: Provider[];
  categories: ServiceCategory[];
}

export function VehicleReportTab({
  vehicle,
  services,
  repairs,
  renewals,
  providers,
  categories,
}: VehicleReportTabProps) {
  // Get date range defaults (default: beginning of current year to end of current year)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  const [includeService, setIncludeService] = useState(true);
  const [includeRepair, setIncludeRepair] = useState(true);
  const [includeRenewal, setIncludeRenewal] = useState(true);

  // Generate Report / Print Preview in new window
  const handlePrint = () => {
    const query = new URLSearchParams({
      start: startDate,
      end: endDate,
      service: String(includeService),
      repair: String(includeRepair),
      renewal: String(includeRenewal),
    }).toString();

    window.open(`/vehicles/${vehicle.id}/report?${query}`, "_blank");
  };

  // Export to CSV
  const handleExportCSV = () => {
    exportHistoryToCSV(
      vehicle,
      services,
      repairs,
      renewals,
      providers,
      categories,
      {
        startDate,
        endDate,
        includeService,
        includeRepair,
        includeRenewal,
      }
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Configuration Card */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">กำหนดรายงาน</CardTitle>
          <CardDescription>กรองประเภทข้อมูลและช่วงเวลาที่ต้องการออกรายงาน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">ช่วงเวลาทำรายการ</Label>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="rep-start" className="text-xs text-muted-foreground">เริ่มต้น / Start Date</Label>
                <Input
                  id="rep-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rep-end" className="text-xs text-muted-foreground">สิ้นสุด / End Date</Label>
                <Input
                  id="rep-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Type Checkboxes */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">ประเภทข้อมูล</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inc-service"
                  checked={includeService}
                  onCheckedChange={(v) => setIncludeService(v === true)}
                />
                <Label htmlFor="inc-service" className="cursor-pointer text-sm">
                  ประวัติบำรุงรักษา / Maintenance
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inc-repair"
                  checked={includeRepair}
                  onCheckedChange={(v) => setIncludeRepair(v === true)}
                />
                <Label htmlFor="inc-repair" className="cursor-pointer text-sm">
                  ประวัติซ่อมแซม / Repair Logs
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inc-renewal"
                  checked={includeRenewal}
                  onCheckedChange={(v) => setIncludeRenewal(v === true)}
                />
                <Label htmlFor="inc-renewal" className="cursor-pointer text-sm">
                  รายการต่ออายุ/ภาษี / Renewals
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handlePrint} className="w-full gap-2">
              <Printer className="h-4 w-4" /> พิมพ์รายงาน / Save PDF
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="w-full gap-2">
              <Download className="h-4 w-4" /> ส่งออก Excel / Google Sheets
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">โครงร่างรายงาน</CardTitle>
          <CardDescription>ข้อมูลรถยนต์ที่จะถูกจัดส่งออกในเอกสารรายงาน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block text-xs">ยี่ห้อและรุ่น / Brand & Model</span>
                <span className="font-semibold text-base">{vehicle.brand} {vehicle.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">ทะเบียนรถ / License Plate</span>
                <span className="font-semibold text-base">{vehicle.plate_no ?? "-"}</span>
              </div>
            </div>
            <hr className="my-2 border-muted-foreground/20" />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block">เลขไมล์ล่าสุด</span>
                <span className="font-medium">{vehicle.odometer.toLocaleString()} กม.</span>
              </div>
              <div>
                <span className="text-muted-foreground block">ปีรถยนต์</span>
                <span className="font-medium">{vehicle.year ?? "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">ประเภทน้ำมัน</span>
                <span className="font-medium">{vehicle.fuel_type}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> คำอธิบายและคำแนะนำ
            </Label>
            <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
              <li>ระบบจะทำการรวมประวัติทั้งหมดเข้าเป็นใบรายงานใบเดียวเรียงตามวันที่ทำรายการ</li>
              <li>การเลือก **พิมพ์รายงาน / Save PDF** จะเปิดหน้าแท็บใหม่ที่เป็นแบบฟอร์มจัดหน้าสำหรับเครื่องพิมพ์ หากคุณเลือกเซฟเป็น PDF แนะนำให้ติ๊กเลือกตัวเลือก **&quot;พิมพ์พื้นหลัง / Background graphics&quot;** ในเมนูตั้งค่าการพิมพ์ของเบราว์เซอร์</li>
              <li>การเลือก **ส่งออก Excel / Google Sheets** จะสร้างไฟล์ `.csv` เข้ารหัสภาษาไทยพิเศษ ทำให้เปิดใช้งานบนโปรแกรมสเปรดชีตใดๆ ได้ทันทีภาษาไทยไม่เพี้ยน</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
