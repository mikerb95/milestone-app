import { intlLocale, type Locale } from "./i18n";

/** Fecha civil YYYY-MM-DD. Es el formato que guardamos en la base. */
export type ISODate = string;

/**
 * "Hoy" según la zona del usuario y su hora de corte. Con un corte a las 3:00,
 * registrar algo a la 1:30 de la madrugada sigue contando para el día anterior.
 */
export function todayISO(timezone: string, dayCutoffHour = 0, now = new Date()): ISODate {
  const shifted = new Date(now.getTime() - dayCutoffHour * 3600_000);
  return toISOInZone(shifted, timezone);
}

export function toISOInZone(date: Date, timezone: string): ISODate {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

/** Parsea YYYY-MM-DD como fecha local, sin que el huso corra el día. */
export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86_400_000);
}

/** Índice del día con el lunes en 0, que es el orden de la rejilla semanal. */
export function mondayIndex(iso: ISODate): number {
  return (parseISO(iso).getDay() + 6) % 7;
}

export function weekStart(iso: ISODate, firstDayOfWeek = 1): ISODate {
  const d = parseISO(iso);
  const offset = (d.getDay() - firstDayOfWeek + 7) % 7;
  d.setDate(d.getDate() - offset);
  return toISO(d);
}

export function weekDays(startIso: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startIso, i));
}

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

/** El diseño limpia los puntos y el "de" del formato largo en español. */
function clean(s: string): string {
  return s.replace(/\./g, "").replace(/ de /g, " ");
}

export function formatDate(iso: ISODate, locale: Locale): string {
  return clean(
    new Intl.DateTimeFormat(intlLocale(locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parseISO(iso)),
  );
}

export function formatDateShort(iso: ISODate, locale: Locale): string {
  return clean(
    new Intl.DateTimeFormat(intlLocale(locale), {
      day: "numeric",
      month: "short",
    }).format(parseISO(iso)),
  );
}

export function formatDayLong(iso: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseISO(iso));
}

export function formatWeekRange(startIso: ISODate, locale: Locale): string {
  const end = addDays(startIso, 6);
  return `${formatDateShort(startIso, locale)} - ${formatDateShort(end, locale)}, ${parseISO(end).getFullYear()}`;
}

export function formatNumber(n: number, locale: Locale): string {
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat(intlLocale(locale)).format(rounded);
}

/** Minutos a "1h30m", como en las celdas de hábitos de duración. */
export function formatDuration(mins: number): string {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h${m}m` : `${h}h`;
}

/** "4 semanas restantes" / "5 meses restantes", según cuánto falte. */
export function timeLeftLabel(
  targetDate: ISODate | null,
  today: ISODate,
  locale: Locale,
): string {
  if (!targetDate) return "";
  const days = diffDays(targetDate, today);
  if (days < 0) {
    const n = Math.abs(days);
    if (locale === "es")
      return n === 1 ? "Venció ayer" : `Venció hace ${n} días`;
    return n === 1 ? "Due yesterday" : `${n} days overdue`;
  }
  if (days === 0) return locale === "es" ? "Vence hoy" : "Due today";
  if (days === 1) return locale === "es" ? "1 día restante" : "1 day left";
  if (days < 14)
    return locale === "es" ? `${days} días restantes` : `${days} days left`;
  if (days < 60) {
    const w = Math.round(days / 7);
    return locale === "es" ? `${w} semanas restantes` : `${w} weeks left`;
  }
  if (days < 365) {
    const m = Math.round(days / 30);
    return locale === "es" ? `${m} meses restantes` : `${m} months left`;
  }
  const y = Math.round((days / 365) * 10) / 10;
  return locale === "es" ? `${y} años restantes` : `${y} years left`;
}

/** Fecha meta implícita de cada horizonte al crear una meta. */
export function defaultTargetDate(timeframe: string, today: ISODate): ISODate | null {
  const d = parseISO(today);
  switch (timeframe) {
    case "week":
      return addDays(weekStart(today, 1), 6);
    case "month":
      return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    case "quarter": {
      const q = Math.floor(d.getMonth() / 3);
      return toISO(new Date(d.getFullYear(), q * 3 + 3, 0));
    }
    case "year":
      return toISO(new Date(d.getFullYear(), 11, 31));
    default:
      return null;
  }
}
