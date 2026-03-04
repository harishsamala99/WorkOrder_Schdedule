import { ZoomLevel } from '../models/work-order.model';

/**
 * Number of days between two dates. Positive if b > a.
 */
export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a + 'T00:00:00') : a;
  const db = typeof b === 'string' ? new Date(b + 'T00:00:00') : b;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/**
 * Visible date range centered on today for each zoom level.
 */
export function getVisibleRange(zoom: ZoomLevel): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);

  switch (zoom) {
    case 'hour':
  start.setHours(start.getHours() - 12); // subtract 12 hours
  end.setHours(end.getHours() + 12);     // add 12 hours
  break;
    case 'day':
      start.setDate(start.getDate() - 14);
      end.setDate(end.getDate() + 14);
      break;
    case 'week':
      start.setMonth(start.getMonth() - 2);
      end.setMonth(end.getMonth() + 2);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 6);
      end.setMonth(end.getMonth() + 6);
      break;
  }
  return { start, end };
}

/**
 * Pixels per day for each zoom level.
 */
export function getPixelsPerDay(zoom: ZoomLevel): number {
  switch (zoom) {
    case 'hour': return 20;
    case 'day': return 60;
    case 'week': return 16;
    case 'month': return 4;
  }
}

/** Convert a date to a pixel offset from visibleStart. */
export function dateToPixel(date: string, visibleStart: Date, ppd: number): number {
  return daysBetween(visibleStart, date) * ppd;
}

/** Width in pixels for a date range. */
export function dateRangeToWidth(startDate: string, endDate: string, ppd: number): number {
  return Math.max(daysBetween(startDate, endDate) * ppd, ppd);
}

/** Convert pixel offset back to a YYYY-MM-DD string. */
export function pixelToDate(px: number, visibleStart: Date, ppd: number): string {
  const days = Math.floor(px / ppd);
  const d = new Date(visibleStart);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Generate header labels for the timeline.
 */
export function generateHeaderDates(
  visibleStart: Date,
  visibleEnd: Date,
  zoom: ZoomLevel
): { date: Date; label: string; isWeekend: boolean }[] {
  const dates: { date: Date; label: string; isWeekend: boolean }[] = [];
  const current = new Date(visibleStart);

  while (current <= visibleEnd) {
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;

    switch (zoom) {
      case 'hour':
        dates.push({
          date: new Date(current),
          label: current.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          isWeekend,
        });
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        dates.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          isWeekend,
        });
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        dates.push({
          date: new Date(current),
          label: `W${getWeekNumber(current)} · ${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          isWeekend: false,
        });
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        dates.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          isWeekend: false,
        });
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  return dates;
}
