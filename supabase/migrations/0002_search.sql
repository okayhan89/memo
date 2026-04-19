-- 0002_search.sql — Korean-aware full-text + trigram search

-- Full-text search vector (simple config: keeps Korean tokens as-is by whitespace;
-- combined with pg_trgm we get reasonable recall for hangul).
alter table public.notes
  add column if not exists search_tsv tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content_text, '')), 'B')
  ) stored;

create index if not exists notes_search_tsv_idx on public.notes using gin (search_tsv);

-- Trigram indexes for fuzzy / substring match (especially helpful for Korean).
create index if not exists notes_title_trgm_idx
  on public.notes using gin (title gin_trgm_ops);
create index if not exists notes_content_trgm_idx
  on public.notes using gin (content_text gin_trgm_ops);

-- ── search_notes ───────────────────────────────────────────────────────────
-- Security definer: we enforce ownership via `where owner_id = auth.uid()`.
-- Returns top N hits ranked by FTS score + trigram similarity + recency.

create or replace function public.search_notes(
  p_query text,
  p_limit integer default 20
)
returns table (
  id uuid,
  title text,
  snippet text,
  rank real,
  edited_at timestamptz,
  is_favorite boolean,
  is_pinned boolean
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_owner uuid := auth.uid();
  v_query text := coalesce(trim(p_query), '');
  v_ts tsquery;
begin
  if v_owner is null then
    return;
  end if;
  if v_query = '' then
    return;
  end if;

  -- Build a prefix-tolerant tsquery: split on whitespace and AND-combine :*
  v_ts := plainto_tsquery('simple', v_query);

  return query
    with fts as (
      select
        n.id,
        n.title,
        n.content_text,
        n.edited_at,
        n.is_favorite,
        n.is_pinned,
        ts_rank(n.search_tsv, v_ts) as fts_rank,
        greatest(
          similarity(coalesce(n.title, ''), v_query),
          similarity(coalesce(n.content_text, ''), v_query)
        ) as trgm_rank
      from public.notes n
      where n.owner_id = v_owner
        and n.deleted_at is null
        and (
          (v_ts <> '' and n.search_tsv @@ v_ts)
          or coalesce(n.title, '') ilike '%' || v_query || '%'
          or coalesce(n.content_text, '') ilike '%' || v_query || '%'
          or similarity(coalesce(n.title, ''), v_query) > 0.15
          or similarity(coalesce(n.content_text, ''), v_query) > 0.1
        )
    )
    select
      fts.id,
      fts.title,
      case
        when fts.content_text ilike '%' || v_query || '%'
          then ts_headline(
            'simple',
            fts.content_text,
            plainto_tsquery('simple', v_query),
            'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,MaxWords=25,MinWords=8,ShortWord=2,FragmentDelimiter=" · "'
          )
        else left(fts.content_text, 140)
      end as snippet,
      (fts.fts_rank * 2.0 + fts.trgm_rank)::real as rank,
      fts.edited_at,
      fts.is_favorite,
      fts.is_pinned
    from fts
    order by rank desc, fts.edited_at desc
    limit least(greatest(p_limit, 1), 100);
end;
$$;

grant execute on function public.search_notes(text, integer) to anon, authenticated;
