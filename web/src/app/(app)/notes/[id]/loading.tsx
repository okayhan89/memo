export default function NoteLoading() {
  return (
    <article className="mx-auto flex min-h-dvh max-w-3xl flex-col px-8 pt-10 pb-24 md:px-12 md:pt-16">
      <header className="flex items-center justify-between text-xs">
        <span className="text-ink-subtle font-mono tracking-[0.18em] uppercase opacity-60">
          불러오는 중…
        </span>
        <div className="flex items-center gap-3">
          <div className="bg-line h-3 w-10 animate-pulse rounded" />
          <div className="bg-line h-3 w-10 animate-pulse rounded" />
          <div className="bg-line h-3 w-6 animate-pulse rounded" />
        </div>
      </header>

      <div className="bg-line/70 mt-10 h-12 w-3/4 animate-pulse rounded" />

      <div className="mt-6 flex gap-1.5">
        <div className="bg-line h-5 w-16 animate-pulse rounded-full" />
        <div className="bg-line h-5 w-12 animate-pulse rounded-full" />
      </div>

      <div className="mt-10 space-y-3">
        <div className="bg-line h-4 w-full animate-pulse rounded" />
        <div className="bg-line h-4 w-[95%] animate-pulse rounded" />
        <div className="bg-line h-4 w-[82%] animate-pulse rounded" />
        <div className="bg-line h-4 w-[88%] animate-pulse rounded" />
        <div className="bg-line h-4 w-[70%] animate-pulse rounded" />
      </div>
    </article>
  );
}
