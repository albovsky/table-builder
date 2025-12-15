type DateFormat = "iso" | "mdy" | "dmy" | "mdy-mon" | "dmy-mon";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

function isoParts(value: string) {
  const match = isoRegex.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return { y: Number(y), m: Number(m), d: Number(d) };
}

export function formatDateDisplay(value: string | null | undefined, fmt: DateFormat): string {
  if (!value) return "";
  const parts = isoParts(value);
  const date = parts ? new Date(Date.UTC(parts.y, parts.m - 1, parts.d)) : new Date(value);
  if (isNaN(date.getTime())) return value;

  const yyyy = parts ? parts.y : date.getUTCFullYear();
  const mm = String(parts ? parts.m : date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(parts ? parts.d : date.getUTCDate()).padStart(2, "0");
  const mon = monthNames[(parts ? parts.m : date.getUTCMonth() + 1) - 1];

  switch (fmt) {
    case "mdy":
      return `${mm}/${dd}/${yyyy}`;
    case "dmy":
      return `${dd}/${mm}/${yyyy}`;
    case "mdy-mon":
      return `${mon} ${dd}, ${yyyy}`;
    case "dmy-mon":
      return `${dd} ${mon} ${yyyy}`;
    case "iso":
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

export function parseDateDisplay(input: string, fmt: DateFormat): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const normalize = (d: Date) => {
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const monthFromName = (name: string) => {
    const idx = monthNames.findIndex((m) => m.toLowerCase() === name.toLowerCase());
    return idx >= 0 ? idx : -1;
  };

  try {
    if (fmt === "iso") {
      const parts = isoParts(trimmed);
      if (parts) {
        const d = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
        return normalize(d);
      }
      const d = new Date(trimmed);
      return normalize(d);
    }

    if (fmt === "mdy" || fmt === "dmy") {
      const parts = trimmed.split(/[\/\-\.]/).map((p) => p.trim());
      if (parts.length !== 3) return null;
      const [p1, p2, p3] = parts;
      const year = Number(p3);
      const first = Number(p1);
      const second = Number(p2);
      if (!year || !first || !second) return null;
      const month = fmt === "mdy" ? first - 1 : second - 1;
      const day = fmt === "mdy" ? second : first;
      const d = new Date(year, month, day);
      return normalize(d);
    }

    if (fmt === "mdy-mon" || fmt === "dmy-mon") {
      const parts = trimmed.split(/[ ,]+/).filter(Boolean);
      if (parts.length < 3) return null;
      const [p1, p2, p3] = parts;
      const year = Number(p3);
      const monthName = fmt === "mdy-mon" ? p1 : p2;
      const dayStr = fmt === "mdy-mon" ? p2 : p1;
      const monthIdx = monthFromName(monthName);
      const day = Number(dayStr);
      if (monthIdx < 0 || !day || !year) return null;
      const d = new Date(year, monthIdx, day);
      return normalize(d);
    }
  } catch {
    return null;
  }

  return null;
}

export type { DateFormat };
