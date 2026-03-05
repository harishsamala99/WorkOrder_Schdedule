import { ZoomLevel } from '../models/work-order.model';

/**
 * Calculates the whole number of days between two dates.
 * Appending 'T00:00:00' ensures the date is parsed in the local timezone
 * at the start of the day, avoiding timezone-related off-by-one errors.
 * Returns a positive number if date `b` is after date `a`.
 */
export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a + 'T00:00:00') : a;
  const db = typeof b === 'string' ? new Date(b + 'T00:00:00') : b;
  // 86,400,000 is the number of milliseconds in one day.
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/**
 * Determines the visible date range for the timeline based on the selected zoom level.
 * The range is centered around the current date.
 */
export function getVisibleRange(zoom: ZoomLevel): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day.
  const start = new Date(today);
  const end = new Date(today);

  switch (zoom) {
    case 'hour':
  start.setHours(start.getHours() - 12); // Show a 24-hour window.
  end.setHours(end.getHours() + 12);
  break;
    case 'day':
      start.setDate(start.getDate() - 14); // Show a ~4 week window.
      end.setDate(end.getDate() + 14);
      break;
    case 'week':
      start.setMonth(start.getMonth() - 2); // Show a ~4 month window.
      end.setMonth(end.getMonth() + 2);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 6); // Show a ~1 year window.
      end.setMonth(end.getMonth() + 6);
      break;
  }
  return { start, end };
}

/**
 * Defines the horizontal scale of the timeline for each zoom level.
 * The value represents the number of pixels each day occupies.
 */
export function getPixelsPerDay(zoom: ZoomLevel): number {
  switch (zoom) {
    case 'hour': return 20;   // Smaller scale for hourly view
    case 'day': return 60;    // Standard scale for daily view
    case 'week': return 16;   // Compressed scale for weekly view
    case 'month': return 4;   // Highly compressed scale for monthly view
  }
}

/**
 * Converts a specific date into a pixel offset from the timeline's start date.
 * This is a core function for positioning elements on the timeline canvas.
 * @param date The date to convert.
 * @param visibleStart The starting date of the visible timeline range.
 * @param ppd The current pixels-per-day scale.
 * @returns The horizontal pixel offset from the left edge of the timeline.
 */
export function dateToPixel(date: string, visibleStart: Date, ppd: number): number {
  return daysBetween(visibleStart, date) * ppd;
}

/**
 * Calculates the width of a work order bar based on its start and end dates.
 * @param startDate The start date of the work order.
 * @param endDate The end date of the work order.
 * @param ppd The current pixels-per-day scale.
 * @returns The width of the bar in pixels. It's guaranteed to be at least one day's width.
 */
export function dateRangeToWidth(startDate: string, endDate: string, ppd: number): number {
  // Ensure a minimum width of one day's worth of pixels for visibility.
  return Math.max(daysBetween(startDate, endDate) * ppd, ppd);
}

/**
 * Converts a pixel offset on the timeline back into a date.
 * This is the inverse of `dateToPixel` and is used for interactions like
 * creating a new work order where the user clicks on the grid.
 * @param px The pixel offset from the left of the timeline.
 * @param visibleStart The starting date of the visible timeline range.
 * @param ppd The current pixels-per-day scale.
 * @returns The date in 'YYYY-MM-DD' format.
 */
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

/**
 * Calculates the ISO 8601 week number for a given date.
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate the number of days past the start of the year and divide by 7.
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Generates the array of header columns for rendering the timeline grid and labels.
 * The format of the labels changes based on the current zoom level.
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
          isWeekend: false, // Weekends are not visually distinct in week view
        });
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        dates.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          isWeekend: false, // Weekends are not visually distinct in month view
        });
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  return dates;
}
