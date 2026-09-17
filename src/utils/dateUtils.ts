export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateIso(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return isSameDay(date, now);
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  // We want Monday as start of week (1)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekDays(baseDate: Date): Date[] {
  const start = getWeekStart(baseDate);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    days.push(next);
  }
  return days;
}

export function addWeeks(date: Date, count: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + count * 7);
  return result;
}

export function addMonths(date: Date, count: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + count);
  return result;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${m} ${ampm}`;
}

export function formatTimeRange(start: string, end?: string): string {
  if (!start) return '';
  const formattedStart = formatTime(start);
  if (!end) return formattedStart;
  const formattedEnd = formatTime(end);
  return `${formattedStart} — ${formattedEnd}`;
}

export function formatDateFull(dateStr: string): string {
  const date = parseDateIso(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHeaderDateRange(currentDate: Date, view: 'week' | 'month'): string {
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  if (view === 'month') {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }

  const weekDays = getWeekDays(currentDate);
  const startDay = weekDays[0];
  const endDay = weekDays[6];

  const startMonth = monthNames[startDay.getMonth()];
  const endMonth = monthNames[endDay.getMonth()];
  const startYear = startDay.getFullYear();
  const endYear = endDay.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startDay.getDate()} — ${endDay.getDate()}, ${startYear}`;
  } else if (startYear === endYear) {
    return `${startMonth} ${startDay.getDate()} — ${endMonth} ${endDay.getDate()}, ${startYear}`;
  } else {
    return `${startMonth} ${startDay.getDate()}, ${startYear} — ${endMonth} ${endDay.getDate()}, ${endYear}`;
  }
}

export interface MonthDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

export function getMonthMatrix(currentDate: Date): MonthDay[][] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const start = getWeekStart(firstDayOfMonth);
  const matrix: MonthDay[][] = [];

  let current = new Date(start);
  // Build 5 or 6 weeks to cover month
  while (current <= lastDayOfMonth || matrix.length < 5) {
    const week: MonthDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      const isCurMonth = d.getMonth() === month;
      week.push({
        date: d,
        dateStr: formatDateIso(d),
        isCurrentMonth: isCurMonth,
        isToday: isToday(d),
        dayNumber: d.getDate(),
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(week);
    if (matrix.length >= 6) break;
  }

  return matrix;
}
