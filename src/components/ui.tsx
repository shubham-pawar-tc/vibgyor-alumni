"use client";

import Link from "next/link";
import { forwardRef, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, RotateCcw, ShieldCheck, X, XCircle } from "lucide-react";
import { avatarHue, cn, initials } from "@/lib/utils";

/* ------------------------------ Logo ------------------------------ */

/** Brand tiles, left to right, exactly as in the VIBGYOR Group of Schools wordmark. */
const LOGO_TILES = [
  { ch: "V", c: "var(--r)" },
  { ch: "I", c: "var(--o)" },
  { ch: "B", c: "var(--y)" },
  { ch: "G", c: "var(--g)" },
  { ch: "Y", c: "var(--b)" },
  { ch: "O", c: "var(--i)" },
  { ch: "R", c: "var(--v)" },
];

const logoSizes = {
  sm: { tile: "h-6 w-5 text-sm", gap: "gap-[2px]", sub: "text-xs tracking-[0.18em]" },
  md: { tile: "h-[30px] w-[26px] text-lg", gap: "gap-[2px]", sub: "text-xs tracking-[0.2em]" },
  lg: { tile: "h-14 w-12 text-4xl", gap: "gap-1", sub: "text-lg tracking-[0.24em]" },
};

/** The seven-tile VIBGYOR wordmark on its own. */
export function LogoTiles({ size = "md", className }: { size?: keyof typeof logoSizes; className?: string }) {
  const s = logoSizes[size];
  return (
    <span className={cn("flex", s.gap, className)} aria-hidden>
      {LOGO_TILES.map((t, i) => (
        <span
          key={t.ch}
          className={cn(
            "brand-tile grid place-items-center font-display font-semibold leading-none text-white",
            s.tile,
            i === 0 ? "rounded-l-[5px] rounded-r-[2px]" : i === LOGO_TILES.length - 1 ? "rounded-r-[5px] rounded-l-[2px]" : "rounded-[2px]"
          )}
          style={{ background: t.c }}
        >
          {t.ch}
        </span>
      ))}
    </span>
  );
}

/** Full lockup: coloured tiles with "ALUMNI ASSOCIATION" set underneath, like "GROUP OF SCHOOLS". */
export function BrandLockup({ size = "md", sub = "Alumni Association" }: { size?: keyof typeof logoSizes; sub?: string }) {
  const s = logoSizes[size];
  return (
    <span className="inline-flex flex-col items-stretch">
      <LogoTiles size={size} />
      <span className={cn("mt-1 whitespace-nowrap text-center font-semibold uppercase leading-none text-brand-ink", s.sub)}>{sub}</span>
    </span>
  );
}

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center" aria-label="VIBGYOR Alumni Association home">
      {compact ? <LogoTiles size="sm" /> : <BrandLockup size="md" />}
    </Link>
  );
}

/* ------------------------------ Button ------------------------------ */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

/** Button tokens: heights and radius come from --btn-* in globals.css. */
const variantCls: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-xs",
  secondary: "bg-surface text-text border border-border-strong hover:bg-surface-2 shadow-xs",
  ghost: "text-text hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-95 shadow-xs",
  soft: "bg-primary-soft text-primary hover:bg-surface-3",
};
const sizeCls: Record<Size, string> = {
  sm: "h-[var(--btn-h-sm)] px-3 text-sm gap-2",
  md: "h-[var(--btn-h-md)] px-4 text-sm gap-2",
  lg: "h-[var(--btn-h-lg)] px-5 text-body gap-2",
};

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", className, href, children, ...rest },
  ref
) {
  const cls = cn(
    "ds-interactive ds-press inline-flex items-center justify-center rounded-[var(--btn-radius)] font-semibold whitespace-nowrap focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none [&>svg]:shrink-0",
    variantCls[variant],
    sizeCls[size],
    className
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
});

/* ------------------------------ Card ------------------------------ */

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[var(--card-radius)] border border-border bg-surface", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 text-muted [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-body font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ Pill ------------------------------ */

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
const toneCls: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export function Pill({ tone = "neutral", children, className, icon }: { tone?: Tone; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-[var(--radius-sm)] px-2 text-label font-medium whitespace-nowrap [&>svg]:h-3.5 [&>svg]:w-3.5", toneCls[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/* ------------------------------ Avatar ------------------------------ */

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const h = avatarHue(name);
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${h} 55% var(--avatar-bg-l))`,
        color: `hsl(${h} 50% var(--avatar-fg-l))`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------ Form ------------------------------ */

export function Field({ label, hint, children, htmlFor, error }: { label: string; hint?: React.ReactNode; children: React.ReactNode; htmlFor?: string; error?: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-label font-medium text-danger" role="alert" id={htmlFor ? `${htmlFor}-err` : undefined}>
          {error}
        </p>
      ) : (
        hint && <p className="text-label text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Inline error under a field that isn't wrapped in <Field>. */
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-label font-medium text-danger" role="alert">
      {error}
    </p>
  );
}

/** Input tokens: --input-h and --input-radius in globals.css. */
const inputBase =
  "w-full rounded-[var(--input-radius)] border border-border-strong bg-surface px-3 text-sm text-text placeholder:text-subtle transition-[border-color,box-shadow] duration-150 hover:border-subtle focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-[var(--ring)] disabled:bg-surface-2 disabled:text-muted";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; invalid?: boolean };
const invalidCls = "border-danger hover:border-danger focus:border-danger focus:ring-danger/20";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, icon, invalid, ...rest }, ref) {
  if (invalid) {
    rest["aria-invalid"] = true;
    className = cn(invalidCls, className);
  }
  if (!icon) return <input ref={ref} className={cn(inputBase, "h-[var(--input-h)]", className)} {...rest} />;
  return (
    <div className="group/input relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <input ref={ref} className={cn(inputBase, "h-[var(--input-h)] pl-10", className)} {...rest} />
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(inputBase, "py-3 leading-relaxed", className)} {...rest} />;
});

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "h-[var(--input-h)] appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6b85' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60")}>
      <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--secondary)]" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
        checked ? "bg-secondary" : "bg-border-strong"
      )}
    >
      <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/* ------------------------------ Callout ------------------------------ */

const calloutIcon = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: XCircle,
  safe: ShieldCheck,
};
const calloutCls = {
  info: "bg-info-soft text-info border-info/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  success: "bg-success-soft text-success border-success/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  safe: "bg-primary-soft text-primary border-primary/20",
};

export function Callout({ tone = "info", title, children, className }: { tone?: keyof typeof calloutCls; title?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  const Icon = calloutIcon[tone];
  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3", calloutCls[tone], className)}>
      <Icon className="mt-[3px] h-4 w-4 shrink-0" />
      <div className="min-w-0 text-sm leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-text/80">{children}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Stat ------------------------------ */

export function Stat({ label, value, sub, icon, tone = "primary" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; tone?: Tone }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label font-medium text-muted">{label}</p>
        {icon && <span className={cn("text-subtle [&>svg]:h-4 [&>svg]:w-4", tone === "danger" && "text-danger", tone === "warning" && "text-warning")}>{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-2 text-label text-muted">{sub}</p>}
    </Card>
  );
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  icon,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** Kept for API compatibility. Page titles carry no decorative icon. */
  icon?: React.ReactNode | false;
}) {
  void icon;
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------ Tabs ------------------------------ */

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number; dot?: boolean }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-5 border-b border-border" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "ds-interactive -mb-px inline-flex h-10 items-center gap-2 whitespace-nowrap border-b-2 text-sm font-medium",
              value === t.id ? "border-primary text-text" : "border-transparent text-muted hover:text-text"
            )}
          >
            {t.label}
            {t.dot && <span className="h-2 w-2 rounded-full bg-warning" aria-label="needs action" />}
            {t.count !== undefined && (
              <span className={cn("rounded-[var(--radius-sm)] px-2 text-xs tabular-nums", value === t.id ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted")}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Modal ------------------------------ */

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="animate-in fixed inset-0 z-50 flex items-end justify-center bg-[rgb(10_16_28/0.5)] p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        className={cn("animate-in flex max-h-[92vh] w-full flex-col rounded-t-xl border border-border bg-surface shadow-lg sm:rounded-xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="ds-interactive grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Empty ------------------------------ */

export function Empty({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <span className="mb-3 text-subtle [&>svg]:h-6 [&>svg]:w-6">{icon}</span>}
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

/* ------------------------------ Req tag ------------------------------ */
/** Small reference to the RFQ requirement a screen demonstrates. */
export function Req({ ids }: { ids: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-border px-2 py-0.5 font-mono text-xs font-medium text-muted" title="RFQ requirement reference">
      {ids}
    </span>
  );
}

/* ------------------------------ Table ------------------------------ */
/**
 * Data table with the system's header, row height and dividers (tokens: --table-*).
 * Wraps itself in a bordered, horizontally scrollable container so wide tables
 * never push the page sideways on phones.
 */
export function Table({ children, className, minWidth = 640 }: { children: React.ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={cn("overflow-x-auto rounded-[var(--card-radius)] border border-border bg-surface", className)}>
      <table className="ds-table" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

/* ------------------------------ Layout ------------------------------ */

/** Page-width container with the standard gutter. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

/* ------------------------------ Loading ------------------------------ */

/** Placeholder block with a soft shimmer. Size it with className (h-*, w-*). */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("skeleton block", className)} aria-hidden />;
}

/** Skeleton for a list of rows inside a Card — matches CardHeader + list row spacing. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Error ------------------------------ */

/** Inline error state with an optional retry, styled to sit where content would be. */
export function ErrorState({ title = "Something went wrong", children, onRetry }: { title?: string; children?: React.ReactNode; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center" role="alert">
      <XCircle className="mb-3 h-6 w-6 text-danger" />
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
