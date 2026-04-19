import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getNote } from '@/features/notes/repository';
import { proseMirrorToMarkdown } from '@/features/notes/markdown';

function safeFilename(name: string, fallback: string) {
  const trimmed = (name || '').trim();
  const base = trimmed.length > 0 ? trimmed : fallback;
  return base.replace(/[^\p{L}\p{N}._-]+/gu, '-').slice(0, 80);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const note = await getNote(supabase, user.id, id);
  if (!note) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const title = note.title.trim().length > 0 ? note.title : '제목 없음';
  const body = proseMirrorToMarkdown(note.content_json);
  const markdown = `# ${title}\n\n${body}`.trim() + '\n';

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeFilename(title, 'memo')}.md"`,
    },
  });
}
