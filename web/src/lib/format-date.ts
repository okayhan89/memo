const RTF = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

export function formatRelative(input: string | Date, now: Date = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  let duration = (date.getTime() - now.getTime()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RTF.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return RTF.format(Math.round(duration), 'year');
}
