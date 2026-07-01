import type { ServiceCategory } from "./types";

/** Resolve a service-category code to a bilingual label using the reference list. */
export function serviceCategoryLabel(
  code: string,
  categories: ServiceCategory[]
): string {
  const found = categories.find((c) => c.code === code);
  if (found) return `${found.label_th}`;
  return code;
}

export function serviceCategoryLabelFull(
  code: string,
  categories: ServiceCategory[]
): string {
  const found = categories.find((c) => c.code === code);
  if (found) return `${found.label_th} (${found.label_en})`;
  return code;
}
