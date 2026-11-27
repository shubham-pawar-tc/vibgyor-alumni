# Design system

One visual language for every screen. Pages never define their own colours, radii or shadows: they use the tokens in `src/app/globals.css` (exposed as Tailwind utilities) and the components in `src/components/ui.tsx`.

## Principles

- Borders and whitespace separate content; shadows are rare (menus, modals, the hero preview).
- Lists, tables and divided rows before card grids. A card is a container for related content, not decoration.
- Icons only where they carry meaning (navigation, status, input affordance). No coloured icon tiles.
- Motion is restrained and purposeful (see Motion below). Nothing loops or moves on its own.
- The VIBGYOR rainbow appears in the logo only.

## Tokens (`globals.css`)

| Group | Tokens | Tailwind |
|---|---|---|
| Brand | `--brand-navy #172B4D`, `--brand-blue #3978E8`, `--brand-teal #16A68A` | — |
| Surfaces | `--bg` (#F5F7FA / #101827), `--surface` (#FFF / #1D2939), `--surface-2`, `--surface-3` | `bg-bg`, `bg-surface`, `bg-surface-2` |
| Lines | `--border`, `--border-strong` | `border-border`, `border-border-strong` |
| Text | `--text`, `--muted`, `--subtle` (captions and placeholders only) | `text-text`, `text-muted`, `text-subtle` |
| Interactive | `--primary` (navy; light blue in dark), `--secondary` (focus, selection), `--link`, `--accent`, `--accent-strong` | `bg-primary`, `text-link`, `text-accent-strong` |
| Status | `--success`, `--warning`, `--danger`, `--info` + `-soft` fills | `text-success`, `bg-danger-soft` … |
| Type | Inter (`--font-sans`, body/UI), Manrope (`--font-display`, h1–h4 and figures) | `font-sans`, `font-display` |
| Radius | components 8–12px (buttons/inputs/nav 8, cards 12); inline marks 4–6px | `rounded-lg`, `rounded-[var(--card-radius)]` |
| Shadow | `--shadow-xs/sm/md/lg` | `shadow-xs` … |
| Layout | `--container` 72rem, `--gutter` 16/24px, `--section-y`, `--header-h`, `--sidebar-w` | `.container-page`, `.section-y` |
| Buttons | `--btn-h-sm/md/lg` (32/40/48px), `--btn-radius` 8px | `<Button>` |
| Inputs | `--input-h` 40px, `--input-radius`, `--ring` | `<Input>`, `<Select>`, `<Textarea>` |
| Navigation | `--nav-item-h` 36px, `--nav-item-radius` | `AppShell` sidebar |
| Cards | `--card-radius` 12px, `--card-pad` | `<Card>`, `<CardHeader>` |
| Tables | `--table-row-h` 48px, `--table-head-h` 40px | `<Table>` / `.ds-table` |

**Type scale** (the only sizes allowed; no `text-[Npx]`): `text-xs` 12 · `text-label` 13 · `text-sm` 14 · `text-body` 15 · `text-base` 16 · `text-lg` 18 · `text-xl` 20 · `text-2xl` 24 · `text-3xl` 28 · `text-4xl` 36 · `text-5xl` 48, each with a paired line height. Headings use Manrope at weight 600; figures may use 600–700.

**Spacing** follows Tailwind's 4px grid in whole steps (4, 8, 12, 16, 20, 24, 32…). Half steps are allowed only for 2px optical nudges (`mt-0.5`).

## Theme

Light by default. `ThemeToggle` (`src/components/ThemeToggle.tsx`) writes `vaa-theme` to localStorage and sets `data-theme` on `<html>`; an inline script in `app/layout.tsx` applies it before first paint on every route. With nothing saved, the OS setting is followed live. Dark values are defined once for `[data-theme="dark"]` and once for `prefers-color-scheme: dark` (keep them identical).

## Components (`ui.tsx`)

`Button` (primary · secondary · ghost · soft · danger; sm · md · lg), `Skeleton`, `SkeletonList`, `ErrorState`, `Card`, `CardHeader`, `Pill`, `Avatar`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Callout`, `Stat`, `PageHeader`, `Tabs` (underline), `Modal`, `Empty`, `Table`, `Container`, `Logo`.

## Motion

Motion for React (`motion/react`) plus CSS transitions. All primitives live in `src/components/motion.tsx`; screens don't define their own animation.

| Use | Primitive | Timing |
|---|---|---|
| Hover, press, colour change | `.ds-interactive`, `.ds-press` (scale 0.98) | 150ms |
| Dropdowns, mobile menu | `<Dropdown>` | 200ms in, 150ms out |
| Mobile sidebar | `<Drawer>` | 250ms slide |
| Active nav indicator | shared `layoutId` highlight | 200ms |
| Route change (portal) | `<PageTransition>` | 250ms fade + 6px |
| Hero copy | `<Enter>` / `<EnterItem>` | 500ms, 80ms stagger |
| Section reveal | `<Reveal>` (once per section, not per element) | 500ms fade + 12px |
| Charts / progress | `<AnimatedBar>` | 700ms grow, 60ms stagger |
| Theme switch | `.theme-transition` on `<html>` | 200ms colour cross-fade |
| Loading | `<Skeleton>`, `<SkeletonList>`, portal loading shell | shimmer |

Easing: `cubic-bezier(0.22, 1, 0.36, 1)`. No bounce, spin, parallax or looping decoration. `MotionProvider` sets `reducedMotion="user"`, CSS has a `prefers-reduced-motion` override, and bar charts and the theme fade switch off explicitly.

## States

Empty: `<Empty>` · Loading: `<Skeleton>` / `<SkeletonList>` · Error: `<ErrorState>` (also the app-wide `app/error.tsx`).
