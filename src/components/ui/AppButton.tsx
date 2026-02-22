/**
 * AppButton — Reusable button / link component that adapts to dark & light mode
 * via CSS custom properties defined in index.css.
 *
 * Usage:
 *   <AppButton variant="primary" size="md" onClick={...}>Save</AppButton>
 *   <AppButton variant="secondary" size="lg" disabled>Cancel</AppButton>
 *   <AppButton variant="danger">Delete</AppButton>
 *
 *   // As a router link:
 *   <AppButtonLink to="/pricing" variant="primary" size="lg">View Plans</AppButtonLink>
 *
 * Variants:
 *   primary   — solid blue, always visible in both themes
 *   secondary — bordered button with theme-aware background
 *   ghost     — transparent with subtle hover, for low-emphasis actions
 *   danger    — solid red, for destructive actions
 *
 * Sizes:
 *   sm  — small (px-3 py-1.5, text-xs)
 *   md  — default (px-4 py-2, text-sm)
 *   lg  — large (px-5 py-2.5, text-sm)
 *   xl  — extra-large (px-6 py-3, text-base)
 *   icon — square icon button (p-2)
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

export type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
export type BtnSize = "sm" | "md" | "lg" | "xl" | "icon";

// ── Shared base classes ───────────────────────────────────────────────────────
const BASE =
  "inline-flex items-center justify-center gap-2 font-medium " +
  "transition-colors duration-150 cursor-pointer select-none " +
  "disabled:opacity-55 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

// ── Variant classes using CSS custom properties set in index.css ──────────────
const VARIANT: Record<BtnVariant, string> = {
  primary:
    "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] " +
    "border border-[var(--btn-primary-bg)]/40 " +
    "hover:bg-[var(--btn-primary-hover)] active:brightness-90",

  secondary:
    "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] " +
    "border border-[var(--btn-secondary-border)] " +
    "hover:bg-[var(--btn-secondary-hover)]",

  ghost:
    "bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] " +
    "border border-transparent " +
    "hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--btn-ghost-text-hover)]",

  danger:
    "bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] " +
    "border border-[var(--btn-danger-bg)]/40 " +
    "hover:bg-[var(--btn-danger-hover)] active:brightness-90",
};

// ── Size classes ──────────────────────────────────────────────────────────────
const SIZE: Record<BtnSize, string> = {
  sm:   "px-3 py-1.5 text-xs rounded-lg",
  md:   "px-4 py-2 text-sm rounded-lg",
  lg:   "px-5 py-2.5 text-sm rounded-xl",
  xl:   "px-6 py-3 text-base rounded-xl",
  icon: "p-2 rounded-lg",
};

// ── AppButton (button element) ────────────────────────────────────────────────
export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    >
      {children}
    </button>
  )
);
AppButton.displayName = "AppButton";

// ── AppButtonLink (react-router Link styled as button) ────────────────────────
export interface AppButtonLinkProps extends Omit<LinkProps, "className"> {
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
  children: ReactNode;
}

export function AppButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: AppButtonLinkProps) {
  return (
    <Link
      {...rest}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
