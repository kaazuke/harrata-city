"use client";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_92%,black)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          backgroundImage: `
            linear-gradient(168deg, color-mix(in oklab, var(--rp-fg) 4%, transparent) 0%, transparent 48%),
            radial-gradient(1000px circle at 14% -8%, color-mix(in oklab, var(--rp-primary) 9%, transparent), transparent 54%),
            radial-gradient(780px circle at 96% 12%, color-mix(in oklab, var(--rp-secondary) 7%, transparent), transparent 50%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `linear-gradient(90deg, color-mix(in oklab, var(--rp-border) 55%, transparent) 1px, transparent 1px),
            linear-gradient(0deg, color-mix(in oklab, var(--rp-border) 55%, transparent) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--rp-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-[var(--rp-fg)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--rp-muted)] sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
