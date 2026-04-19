'use client';

import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useLayoutEffect, useRef } from 'react';
import './prose.css';

const lowlight = createLowlight(common);

export type RichEditorValue = {
  json: unknown;
  text: string;
};

type Props = {
  initialContent?: unknown;
  placeholder?: string;
  onChange: (value: RichEditorValue) => void;
  ariaLabel?: string;
};

export function RichEditor({
  initialContent,
  placeholder = '쓰기 시작하세요… `/`로 빠른 포맷, ⌘B 굵게, ⌘I 기울임',
  onChange,
  ariaLabel = '본문',
}: Props) {
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        // Disable StarterKit's bundled link so we can use the richer config below.
        link: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: normaliseContent(initialContent),
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        'aria-label': ariaLabel,
        spellcheck: 'true',
      },
    },
    onUpdate({ editor: e }) {
      onChangeRef.current({ json: e.getJSON(), text: e.getText() });
    },
  });

  useEffect(
    () => () => {
      editor?.destroy();
    },
    [editor],
  );

  return <EditorContent editor={editor as Editor | null} />;
}

function normaliseContent(value: unknown): JSONContent {
  if (!value || typeof value !== 'object') {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  return value as JSONContent;
}
