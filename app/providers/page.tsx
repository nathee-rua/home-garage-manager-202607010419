import { Store, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProviderFormDialog } from "@/components/forms/ProviderFormDialog";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { ConfigBanner } from "@/components/ConfigBanner";
import { getProviders } from "@/lib/queries";
import { providerTypeLabels } from "@/lib/labels";
import { deleteProvider } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="ร้าน / ศูนย์บริการ"
        subtitle="Providers · ทำเนียบร้านและศูนย์บริการ"
        actions={<ProviderFormDialog />}
      />
      <ConfigBanner />

      {providers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="ยังไม่มีร้าน/ศูนย์บริการ"
          description="เพิ่มร้านที่คุณใช้บริการเป็นประจำ เช่น ศูนย์บริการ B-Quik หรืออู่ใกล้บ้าน"
          action={<ProviderFormDialog />}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead className="hidden sm:table-cell">สาขา</TableHead>
                  <TableHead className="hidden md:table-cell">ติดต่อ</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.name}
                      {p.note ? (
                        <span className="block text-xs text-muted-foreground">{p.note}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{providerTypeLabels[p.type].th}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{p.branch ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="space-y-0.5 text-sm">
                        {p.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {p.phone}
                          </span>
                        ) : null}
                        {p.line_contact ? (
                          <span className="block text-muted-foreground">
                            LINE: {p.line_contact}
                          </span>
                        ) : null}
                        {!p.phone && !p.line_contact ? "-" : null}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteProvider.bind(null, p.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
