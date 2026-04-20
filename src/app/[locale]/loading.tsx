export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="space-y-3">
        <div className="h-7 w-2/5 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="h-32 animate-pulse rounded-[var(--rp-radius)] bg-white/[0.04]" />
          <div className="h-32 animate-pulse rounded-[var(--rp-radius)] bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
