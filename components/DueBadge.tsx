import { Badge } from "@/components/ui/badge";
import { dueStatusLabels } from "@/lib/labels";
import type { DueStatus } from "@/lib/types";

const variantByStatus: Record<DueStatus, "success" | "warning" | "destructive"> = {
  normal: "success",
  due_soon: "warning",
  overdue: "destructive",
};

export function DueBadge({ status }: { status: DueStatus }) {
  const label = dueStatusLabels[status];
  return (
    <Badge variant={variantByStatus[status]} title={label.en}>
      {label.th}
    </Badge>
  );
}
