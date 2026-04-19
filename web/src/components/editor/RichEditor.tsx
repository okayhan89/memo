'use client';

import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { uploadNoteImage } from '@/features/notes/uploadImage';
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
  /**
   * Disable image upload for environments where Supabase Storage isn't
   * set up (e.g. the guest editor on the public landing). Defaults to true
   * for the authenticated note editor.
   */
  allowImageUpload?: boolean;
};

export function RichEditor({
  initialContent,
  placeholder = '쓰기 시작하세요… `/`로 빠른 포맷, ⌘B 굵게, ⌘I 기울임, 이미지 붙여넣기도 OK',
  onChange,
  ariaLabel = '본문',
  allowImageUpload = true,
}: Props) {
  const onChangeRef = useRef(onChange);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
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
      Image.configure({
        HTMLAttributes: { class: 'prose-editor-image' },
        allowBase64: false,
      }),
    ],
    content: normaliseContent(initialContent),
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        'aria-label': ariaLabel,
        spellcheck: 'true',
      },
      handlePaste(view, event) {
        if (!allowImageUpload) return false;
        const files = extractImageFiles(event.clipboardData);
        if (files.length === 0) return false;
        const imageNode = view.state.schema.nodes.image;
        if (!imageNode) return false;
        event.preventDefault();
        ingestFiles(
          files,
          (url) => {
            view.dispatch(view.state.tr.replaceSelectionWith(imageNode.create({ src: url })));
          },
          setUploadError,
        );
        return true;
      },
      handleDrop(view, event) {
        if (!allowImageUpload) return false;
        const files = extractImageFiles(event.dataTransfer);
        if (files.length === 0) return false;
        const imageNode = view.state.schema.nodes.image;
        if (!imageNode) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        ingestFiles(
          files,
          (url) => {
            const tr = view.state.tr.insert(
              coords?.pos ?? view.state.doc.content.size,
              imageNode.create({ src: url }),
            );
            view.dispatch(tr);
          },
          setUploadError,
        );
        return true;
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

  return (
    <>
      <EditorContent editor={editor as Editor | null} />
      {uploadError ? (
        <p
          role="alert"
          className="text-danger mt-2 text-xs"
          onAnimationEnd={() => setUploadError(null)}
        >
          {uploadError}
        </p>
      ) : null}
    </>
  );
}

function extractImageFiles(data: DataTransfer | null): File[] {
  if (!data) return [];
  const files: File[] = [];
  for (const item of Array.from(data.files)) {
    if (item.type.startsWith('image/')) files.push(item);
  }
  if (files.length > 0) return files;
  for (const item of Array.from(data.items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const f = item.getAsFile();
      if (f) files.push(f);
    }
  }
  return files;
}

async function ingestFiles(
  files: File[],
  onEach: (url: string) => void,
  onError: (message: string) => void,
) {
  for (const file of files) {
    const result = await uploadNoteImage(file);
    if (result.status === 'ok') {
      onEach(result.url);
    } else {
      onError(result.reason);
      window.setTimeout(() => onError(''), 4000);
      break;
    }
  }
}

function normaliseContent(value: unknown): JSONContent {
  if (!value || typeof value !== 'object') {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  return value as JSONContent;
}
