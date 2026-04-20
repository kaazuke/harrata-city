export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "accent" | "success" | "danger" | "warning";
}) {
  const map: Record<string, string> = {
    neutral: "bg-white/[0.06] text-[var(--rp-muted)] border-white/10",
    primary:
      "bg-[color-mix(in_oklab,var(--rp-primary)_18%,transparent)] text-[var(--rp-primary)] border-[color-mix(in_oklab,var(--rp-primary)_35%,transparent)]",
    accent:
      "bg-[color-mix(in_oklab,var(--rp-accent)_18%,transparent)] text-[var(--rp-accent)] border-[color-mix(in_oklab,var(--rp-accent)_35%,transparent)]",
    success:
      "bg-[color-mix(in_oklab,var(--rp-success)_14%,transparent)] text-[var(--rp-success)] border-[color-mix(in_oklab,var(--rp-success)_30%,transparent)]",
    danger:
      "bg-[color-mix(in_oklab,var(--rp-danger)_14%,transparent)] text-[var(--rp-danger)] border-[color-mix(in_oklab,var(--rp-danger)_30%,transparent)]",
    warning:
      "bg-[color-mix(in_oklab,#f5b042_16%,transparent)] text-[#f5b042] border-[color-mix(in_oklab,#f5b042_35%,transparent)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}
