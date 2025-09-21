import type { Prisma } from "@prisma/client";

function valueToNumber(value: Prisma.Decimal | number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return value;
    return null;
  }
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    try {
      const maybe = (value as Prisma.Decimal).toNumber();
      return Number.isFinite(maybe) ? maybe : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function formatArea(value: Prisma.Decimal | number | string | null | undefined): string | null {
  const n = valueToNumber(value);
  if (n === null) return null;
  return n.toFixed(2).replace(".", ",");
}

export function buildOrderTitle(options: {
  city?: string | null;
  customerName?: string | null;
  measuredArea?: Prisma.Decimal | number | string | null;
  fallbackArea?: Prisma.Decimal | number | string | null;
}): string {
  const city = options.city?.trim() || "—";
  const customer = options.customerName?.trim() || "—";
  const areaFormatted =
    formatArea(options.measuredArea ?? undefined) ??
    formatArea(options.fallbackArea ?? undefined) ??
    "—";

  return `${city} ${customer} ${areaFormatted} m2 (z pomiaru)`;
}
