import Link from "next/link";

/** En-tête de section : titre + sous-texte + lien optionnel (UX : parcours clair). */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="rp-section-title">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--rp-muted)] sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link href={action.href} className="rp-link-inline shrink-0 self-start sm:self-auto">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
