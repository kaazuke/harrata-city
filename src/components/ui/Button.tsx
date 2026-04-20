import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "min-h-11 bg-[color-mix(in_oklab,var(--rp-primary)_88%,white)] text-[#041016] shadow-[var(--rp-shadow-glow)] hover:brightness-110 active:scale-[0.98] border border-white/10",
  ghost:
    "min-h-11 bg-white/[0.07] text-[var(--rp-fg)] hover:bg-white/12 active:scale-[0.98] border border-white/12 backdrop-blur-sm",
  outline:
    "min-h-11 border border-white/15 bg-white/[0.03] text-[var(--rp-fg)] backdrop-blur-sm hover:border-[color-mix(in_oklab,var(--rp-primary)_50%,var(--rp-border))] hover:bg-white/[0.06] active:scale-[0.98]",
  danger:
    "min-h-11 bg-[color-mix(in_oklab,var(--rp-danger)_72%,black)] text-white hover:brightness-110 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-w-[2.75rem] cursor-pointer items-center justify-center gap-2 rounded-[var(--rp-radius)] px-5 py-2.5 text-sm font-semibold tracking-tight transition duration-200 ease-out motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rp-primary)] disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
