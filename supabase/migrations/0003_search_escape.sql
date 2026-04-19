-- 0003_search_escape.sql — use private delimiters in ts_headline so the
-- client can safely HTML-escape the snippet and then swap them back to <mark>.
-- Prevents stored-HTML XSS when a note's content_text contains e.g. "<script>".

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
            'StartSel=«mark»,StopSel=«/mark»,MaxFragments=2,MaxWords=25,MinWords=8,ShortWord=2,FragmentDelimiter=" · "'
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
