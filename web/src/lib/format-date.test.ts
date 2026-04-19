import { describe, expect, test } from 'vitest';
import { formatRelative } from './format-date';

const NOW = new Date('2026-04-19T12:00:00Z');

describe('formatRelative', () => {
  test('shows seconds ago', () => {
    const fiveSecondsAgo = new Date(NOW.getTime() - 5_000);
    expect(formatRelative(fiveSecondsAgo, NOW)).toMatch(/초/);
  });

  test('shows minutes ago', () => {
    const threeMinAgo = new Date(NOW.getTime() - 3 * 60_000);
    expect(formatRelative(threeMinAgo, NOW)).toMatch(/분/);
  });

  test('shows hours ago', () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60_000);
    expect(formatRelative(twoHoursAgo, NOW)).toMatch(/시간|어제/);
  });

  test('shows days ago for recent history', () => {
    const threeDaysAgo = new Date(NOW.getTime() - 3 * 24 * 60 * 60_000);
    expect(formatRelative(threeDaysAgo, NOW)).toMatch(/일|그저께|어제/);
  });
});
