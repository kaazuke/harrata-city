export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Carte cliquable : survol + ombre (UX) */
  interactive?: boolean;
}) {
  const hover = interactive
    ? "transition duration-200 ease-out hover:border-[color-mix(in_oklab,var(--rp-primary)_38%,var(--rp-border))] hover:shadow-[var(--rp-shadow-md)] motion-reduce:transition-none"
    : "";
  return (
    <div
      className={`rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-[color-mix(in_oklab,var(--rp-surface)_88%,transparent)] shadow-[var(--rp-shadow-sm)] backdrop-blur-md ${hover} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  /** Contenu optionnel à droite du titre (ex. bouton d’action) */
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--rp-border)] px-6 py-5">
      <div className="min-w-0">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-[var(--rp-fg)]">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--rp-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
