import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const field =
  "w-full min-h-11 rounded-[var(--rp-radius)] border border-[var(--rp-border)] bg-black/20 px-3.5 py-2.5 text-sm text-[var(--rp-fg)] outline-none transition duration-150 placeholder:text-[var(--rp-muted)] focus:border-[color-mix(in_oklab,var(--rp-primary)_50%,var(--rp-border))] focus:bg-black/30 focus:ring-2 focus:ring-[color-mix(in_oklab,var(--rp-primary)_28%,transparent)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${field} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`min-h-[132px] ${field} ${className}`} {...props} />;
});
