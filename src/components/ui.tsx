"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageIconFor } from "@/lib/pageIcons";
import { forwardRef, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, X, XCircle } from "lucide-react";
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
  sm: { tile: "h-6 w-5 text-[14px]", gap: "gap-[2px]", sub: "text-[10px] tracking-[0.18em]" },
  md: { tile: "h-[30px] w-[26px] text-[17px]", gap: "gap-[2px]", sub: "text-[11px] tracking-[0.2em]" },
  lg: { tile: "h-14 w-12 text-[32px]", gap: "gap-1", sub: "text-[17px] tracking-[0.24em]" },
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
            "brand-tile grid place-items-center font-bold leading-none text-white",
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
      <span className={cn("mt-1 whitespace-nowrap text-center font-bold uppercase leading-none text-brand-ink", s.sub)}>{sub}</span>
    </span>
  );
}

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="logo-link tiles-animate flex shrink-0 items-center" aria-label="VIBGYOR Alumni Association home">
      {compact ? <LogoTiles size="sm" /> : <BrandLockup size="md" />}
    </Link>
  );
}

/* ------------------------------ Button ------------------------------ */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary: "shine bg-primary text-primary-fg hover:bg-primary-hover shadow-card hover:shadow-lift hover:-translate-y-px",
  secondary: "bg-surface text-text border border-border hover:bg-surface-2",
  ghost: "text-text hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
  soft: "bg-primary-soft text-primary hover:brightness-95",
};
const sizeCls: Record<Size, string> = {
  sm: "h-8 px-3 text-[14px] gap-1.5 rounded-xl",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
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
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
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
    <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)} {...rest}>
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
        {icon && <span className="mt-0.5 text-primary">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[14px] text-muted">{subtitle}</p>}
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
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap", toneCls[tone], className)}>
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
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-bold", className)}
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
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[14px] font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] font-medium text-danger" role="alert" id={htmlFor ? `${htmlFor}-err` : undefined}>
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Inline error under a field that isn't wrapped in <Field>. */
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-[13px] font-medium text-danger" role="alert">
      {error}
    </p>
  );
}

const inputBase =
  "w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; invalid?: boolean };
const invalidCls = "border-danger focus:border-danger focus:ring-danger/15";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, icon, invalid, ...rest }, ref) {
  if (invalid) {
    rest["aria-invalid"] = true;
    className = cn(invalidCls, className);
  }
  if (!icon) return <input ref={ref} className={cn(inputBase, "h-11", className)} {...rest} />;
  return (
    <div className="group/input relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within/input:text-primary [&>svg]:h-[18px] [&>svg]:w-[18px]">
        {icon}
      </span>
      <input ref={ref} className={cn(inputBase, "h-11 pl-11", className)} {...rest} />
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(inputBase, "py-2.5 leading-relaxed", className)} {...rest} />;
});

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6b85' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60")}>
      <input type="checkbox" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--primary)]" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-[14px] text-muted">{description}</span>}
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
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
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
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  safe: "bg-primary-soft text-primary",
};

export function Callout({ tone = "info", title, children, className }: { tone?: keyof typeof calloutCls; title?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  const Icon = calloutIcon[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl px-4 py-3", calloutCls[tone], className)}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
      <div className="min-w-0 text-[14px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-text/80">{children}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Stat ------------------------------ */

export function Stat({ label, value, sub, icon, tone = "primary" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: React.ReactNode; tone?: Tone }) {
  return (
    <Card className="lift p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-medium text-muted">{label}</p>
        {icon && <span className={cn("grid h-8 w-8 place-items-center rounded-xl", toneCls[tone])}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
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
  /** Override the icon picked automatically from the current route. Pass `false` to hide it. */
  icon?: React.ReactNode | false;
}) {
  const pathname = usePathname();
  const auto = pageIconFor(pathname);
  const AutoIcon = auto?.icon;
  const glyph = icon === false ? null : icon ?? (AutoIcon ? <AutoIcon className="h-[22px] w-[22px]" /> : null);
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {glyph && (
          <span
            className="pop hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary sm:grid"
          >
            {glyph}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <div className="mb-2">{eyebrow}</div>}
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------ Tabs ------------------------------ */

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number; dot?: boolean }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex gap-1 rounded-xl bg-surface-2 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={value === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-[14px] font-semibold transition-colors",
              value === t.id ? "bg-surface text-text shadow-card" : "text-muted hover:text-text"
            )}
          >
            {t.label}
            {t.dot && <span className="h-2 w-2 rounded-full bg-warning" aria-label="needs action" />}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-[12px] tabular-nums", value === t.id ? "bg-primary-soft text-primary" : "bg-border/70")}>{t.count}</span>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        className={cn("animate-in flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-surface shadow-lift sm:rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl text-muted hover:bg-surface-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ Empty ------------------------------ */

export function Empty({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <span className="float mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span>}
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-[14px] text-muted">{children}</div>}
    </div>
  );
}

/* ------------------------------ Req tag ------------------------------ */
/** Small reference to the RFQ requirement a screen demonstrates. */
export function Req({ ids }: { ids: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-border px-1.5 py-0.5 font-mono text-[11.5px] font-medium text-muted" title="RFQ requirement reference">
      {ids}
    </span>
  );
}
