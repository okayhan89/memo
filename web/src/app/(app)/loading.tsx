export default function AppLoading() {
  return (
    <div className="bg-paper-sunken grid min-h-dvh grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-line bg-paper border-r">
        <div className="border-line border-b px-5 py-4">
          <div className="bg-line h-3 w-10 animate-pulse rounded" />
        </div>
        <div className="space-y-2 px-4 py-4">
          <div className="bg-line h-4 w-full animate-pulse rounded" />
          <div className="bg-line h-4 w-[82%] animate-pulse rounded" />
          <div className="bg-line h-4 w-[70%] animate-pulse rounded" />
        </div>
      </aside>
      <main className="bg-paper-raised flex items-center justify-center">
        <p className="text-ink-subtle font-mono text-xs tracking-[0.22em] uppercase">
          불러오는 중…
        </p>
      </main>
    </div>
  );
}
