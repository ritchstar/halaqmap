/** تنسيق تواريخ Google Calendar (محليّة حسب جهاز المستخدم) */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function localBookingRange(dateStr: string, timeStr: string, durationMinutes: number): { start: Date; end: Date } {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  const start = new Date(Y, M - 1, D, h, mi, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
}

function formatGCalSegment(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
}

export function buildGoogleCalendarUrl(params: {
  title: string;
  details: string;
  dateStr: string;
  timeStr: string;
  durationMinutes: number;
}): string {
  const { start, end } = localBookingRange(params.dateStr, params.timeStr, params.durationMinutes);
  const dates = `${formatGCalSegment(start)}/${formatGCalSegment(end)}`;
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    details: params.details,
    dates,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function formatIcsLocal(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function formatIcsUtcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildBookingIcs(params: {
  uid: string;
  title: string;
  description: string;
  dateStr: string;
  timeStr: string;
  durationMinutes: number;
}): string {
  const { start, end } = localBookingRange(params.dateStr, params.timeStr, params.durationMinutes);
  const dtStamp = formatIcsUtcStamp(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HalaqMap//Booking//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatIcsLocal(start)}`,
    `DTEND:${formatIcsLocal(end)}`,
    `SUMMARY:${icsEscape(params.title)}`,
    `DESCRIPTION:${icsEscape(params.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
