'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { createNoteAction } from '@/features/notes/actions';

type Item = {
  id: string;
  label: string;
  hint?: string;
  onSelect: () => void;
  group: '노트' | '이동' | '앱';
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startNote] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const run = useCallback((action: () => void) => {
    action();
    setOpen(false);
  }, []);

  const items: Item[] = [
    {
      id: 'new-note',
      label: '새 노트 만들기',
      hint: '⌘N',
      group: '노트',
      onSelect: () => run(() => startNote(() => createNoteAction({}))),
    },
    {
      id: 'go-notes',
      label: '모든 노트',
      group: '이동',
      onSelect: () => run(() => router.push('/notes')),
    },
    {
      id: 'go-trash',
      label: '휴지통',
      group: '이동',
      onSelect: () => run(() => router.push('/trash')),
    },
    {
      id: 'go-about',
      label: '소개 페이지',
      group: '앱',
      onSelect: () => run(() => router.push('/about')),
    },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="명령 팔레트"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-sm data-[state=closed]:hidden"
    >
      <div className="border-line bg-paper-raised w-full max-w-lg overflow-hidden rounded-lg border shadow-lg">
        <Command.Input
          placeholder="명령을 찾거나 타이핑하세요…"
          className="border-line text-ink placeholder:text-ink-subtle w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-[50vh] overflow-y-auto px-2 py-2">
          <Command.Empty className="text-ink-subtle px-3 py-6 text-sm">
            해당하는 명령이 없어요.
          </Command.Empty>
          {(['노트', '이동', '앱'] as const).map((group) => (
            <Command.Group key={group} heading={group} className="mb-1">
              {items
                .filter((i) => i.group === group)
                .map((item) => (
                  <Command.Item
                    key={item.id}
                    onSelect={item.onSelect}
                    className="text-ink data-[selected=true]:bg-paper-sunken flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm"
                  >
                    <span>{item.label}</span>
                    {item.hint ? (
                      <span className="text-ink-subtle font-mono text-xs">{item.hint}</span>
                    ) : null}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
