import type { Account } from "@/lib/account/types";
import { authorInitials } from "@/lib/forum-mutate";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-24 w-24 text-lg",
};

export function Avatar({
  account,
  fallbackName,
  size = "md",
  className = "",
}: {
  account?: Account | null;
  fallbackName?: string;
  size?: Size;
  className?: string;
}) {
  const name = account?.profile.displayName || account?.username || fallbackName || "?";
  const url = account?.profile.avatarDataUrl;
  const color = account?.profile.color || "var(--rp-primary)";
  const cls = sizes[size];

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`${cls} shrink-0 rounded-full border border-white/10 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${cls} shrink-0 rounded-full border font-semibold uppercase tracking-wider text-[var(--rp-fg)] flex items-center justify-center ${className}`}
      style={{
        background: `color-mix(in oklab, ${color} 22%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 45%, var(--rp-border))`,
      }}
      aria-hidden
    >
      {authorInitials(name)}
    </div>
  );
}
