/* "Funk" layer for public pages: playful but quiet touches shared by the landing page,
   join, login, enquiry and demo. Stickers tilt and straighten on hover; nothing moves on its own. */

import { Emoji, type EmojiName } from "@/components/Emoji";

/** Tilted card that straightens on hover. Add a rotate-* class and position classes. */
export const STICKER =
  "rounded-2xl border border-border bg-surface shadow-lg transition-transform duration-300 ease-[var(--ease-natural)] hover:rotate-0 hover:scale-105";

/** Leaf-shaped frame: two big opposite corners. */
export const LEAF = "rounded-[2rem] rounded-bl-[6rem] rounded-tr-[6rem] sm:rounded-bl-[8rem] sm:rounded-tr-[8rem]";

/** Hand-drawn underline. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M3 12 C 40 3, 70 3, 100 10 S 160 17, 200 9 S 265 2, 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Words with a squiggle underneath. */
export function Underlined({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      <Squiggle className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
    </span>
  );
}

/** Dot grid + soft colour blobs behind a visual. Parent must be `relative`. */
export function Backdrop({ dots = "right", invert }: { dots?: "left" | "right"; invert?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-4 h-3/4 w-3/4 opacity-60 [background-size:18px_18px] ${
          dots === "right" ? "-right-6" : "-left-6"
        } ${invert ? "[background-image:radial-gradient(rgb(255_255_255/0.18)_1.2px,transparent_1.2px)]" : "[background-image:radial-gradient(var(--border-strong)_1.2px,transparent_1.2px)]"}`}
      />
      <div aria-hidden className={`pointer-events-none absolute -left-6 bottom-6 h-56 w-56 rounded-full blur-3xl ${invert ? "bg-accent/20" : "bg-accent-soft"}`} />
      <div aria-hidden className={`pointer-events-none absolute -right-4 top-0 h-48 w-48 rounded-full blur-3xl ${invert ? "bg-secondary/20" : "bg-info-soft"}`} />
    </>
  );
}

/** Eyebrow as a pill with a 3D icon. */
export function PillEyebrow({ emoji, children, invert, className = "" }: { emoji: EmojiName; children: React.ReactNode; invert?: boolean; className?: string }) {
  return (
    <p
      className={`eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1 ${
        invert ? "bg-white/10 !text-white/80" : "bg-accent-soft !text-accent-strong"
      } ${className}`}
    >
      <Emoji name={emoji} size={18} /> {children}
    </p>
  );
}

/** Section heading: pill eyebrow + title, with an optional squiggled phrase. */
export function FunkTitle({
  emoji,
  eyebrow,
  title,
  mark,
  center,
  invert,
}: {
  emoji: EmojiName;
  eyebrow: string;
  title: string;
  /** Part of `title` to underline. */
  mark?: string;
  center?: boolean;
  invert?: boolean;
}) {
  const i = mark ? title.indexOf(mark) : -1;
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <PillEyebrow emoji={emoji} invert={invert}>
        {eyebrow}
      </PillEyebrow>
      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl sm:leading-[1.15]">
        {i < 0 ? (
          title
        ) : (
          <>
            {title.slice(0, i)}
            <Underlined>{mark}</Underlined>
            {title.slice(i + mark!.length)}
          </>
        )}
      </h2>
    </div>
  );
}

/** Round emoji sticker. */
export function EmojiSticker({ name, size = 28, className = "" }: { name: EmojiName; size?: number; className?: string }) {
  return (
    <span className={`${STICKER} grid place-items-center rounded-full ${className}`} style={{ width: size + 22, height: size + 22 }}>
      <Emoji name={name} size={size} />
    </span>
  );
}
