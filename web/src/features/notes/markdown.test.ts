import { describe, expect, test } from 'vitest';
import { proseMirrorToMarkdown } from './markdown';

describe('proseMirrorToMarkdown', () => {
  test('renders headings and paragraphs', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '제목' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '본문.' }] },
      ],
    };
    expect(proseMirrorToMarkdown(doc)).toContain('## 제목');
    expect(proseMirrorToMarkdown(doc)).toContain('본문.');
  });

  test('renders bold and italic text', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '굵게', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' 그리고 ' },
            { type: 'text', text: '기울여', marks: [{ type: 'italic' }] },
          ],
        },
      ],
    };
    expect(proseMirrorToMarkdown(doc)).toContain('**굵게**');
    expect(proseMirrorToMarkdown(doc)).toContain('*기울여*');
  });

  test('renders bullet and task lists', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }],
            },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '완료' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '미완' }] }],
            },
          ],
        },
      ],
    };
    const md = proseMirrorToMarkdown(doc);
    expect(md).toContain('- a');
    expect(md).toContain('- b');
    expect(md).toContain('- [x] 완료');
    expect(md).toContain('- [ ] 미완');
  });

  test('renders links', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '예시',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
      ],
    };
    expect(proseMirrorToMarkdown(doc)).toContain('[예시](https://example.com)');
  });

  test('gracefully handles empty / invalid input', () => {
    expect(proseMirrorToMarkdown(null)).toBe('');
    expect(proseMirrorToMarkdown(undefined)).toBe('');
    expect(proseMirrorToMarkdown('nope')).toBe('');
  });
});
