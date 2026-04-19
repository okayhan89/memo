// Pure ProseMirror-JSON → Markdown renderer. Intentionally tiny (no unified dep)
// so it works inside server actions without pulling large tree-shakeable graphs.

type Node = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: Node[];
};

function renderText(node: Node): string {
  if (!node.text) return '';
  let out = node.text;
  const marks = node.marks ?? [];
  const has = (name: string) => marks.some((m) => m.type === name);
  if (has('code')) out = `\`${out}\``;
  if (has('bold')) out = `**${out}**`;
  if (has('italic')) out = `*${out}*`;
  if (has('strike')) out = `~~${out}~~`;
  const link = marks.find((m) => m.type === 'link');
  if (link) {
    const href = (link.attrs?.href as string) ?? '';
    out = `[${out}](${href})`;
  }
  return out;
}

function renderChildren(nodes: Node[] | undefined): string {
  return (nodes ?? []).map(renderNode).join('');
}

function renderList(node: Node, ordered: boolean): string {
  return (node.content ?? [])
    .map((item, i) => {
      const prefix = ordered ? `${i + 1}. ` : '- ';
      const inner = renderChildren(item.content).trimEnd();
      const indented = inner
        .split('\n')
        .map((line, idx) => (idx === 0 ? line : `  ${line}`))
        .join('\n');
      return `${prefix}${indented}`;
    })
    .join('\n');
}

function renderNode(node: Node): string {
  switch (node.type) {
    case 'doc':
      return renderChildren(node.content).trimEnd() + '\n';
    case 'paragraph':
      return `${renderChildren(node.content)}\n\n`;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 6);
      return `${'#'.repeat(level)} ${renderChildren(node.content)}\n\n`;
    }
    case 'blockquote':
      return (
        renderChildren(node.content)
          .split('\n')
          .map((l) => (l ? `> ${l}` : '>'))
          .join('\n') + '\n\n'
      );
    case 'bulletList':
      return renderList(node, false) + '\n\n';
    case 'orderedList':
      return renderList(node, true) + '\n\n';
    case 'listItem':
      return renderChildren(node.content);
    case 'taskList':
      return (
        (node.content ?? [])
          .map((item) => {
            const checked = Boolean(item.attrs?.checked);
            return `- [${checked ? 'x' : ' '}] ${renderChildren(item.content).trim()}`;
          })
          .join('\n') + '\n\n'
      );
    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? '';
      return `\`\`\`${lang}\n${renderChildren(node.content)}\n\`\`\`\n\n`;
    }
    case 'horizontalRule':
      return '\n---\n\n';
    case 'hardBreak':
      return '  \n';
    case 'text':
      return renderText(node);
    default:
      return renderChildren(node.content);
  }
}

export function proseMirrorToMarkdown(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  return renderNode(doc as Node).trim() + '\n';
}
