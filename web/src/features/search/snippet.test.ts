import { describe, expect, test } from 'vitest';
import { renderSnippet } from './snippet';

describe('renderSnippet', () => {
  test('returns empty string for empty input', () => {
    expect(renderSnippet(undefined)).toBe('');
    expect(renderSnippet(null)).toBe('');
    expect(renderSnippet('')).toBe('');
  });

  test('escapes HTML in the source and wraps delimiters into <mark>', () => {
    const input = 'before «mark»hit«/mark» <script>alert(1)</script> after';
    const output = renderSnippet(input);
    expect(output).toBe('before <mark>hit</mark> &lt;script&gt;alert(1)&lt;/script&gt; after');
  });

  test('handles multiple matches', () => {
    const input = '«mark»a«/mark» and «mark»b«/mark»';
    expect(renderSnippet(input)).toBe('<mark>a</mark> and <mark>b</mark>');
  });

  test('does not double-escape already-encoded entities', () => {
    const input = 'AT&amp;T vs «mark»&«/mark»';
    expect(renderSnippet(input)).toBe('AT&amp;amp;T vs <mark>&amp;</mark>');
  });
});
