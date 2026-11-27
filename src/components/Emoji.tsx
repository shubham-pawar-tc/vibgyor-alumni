/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized; plain <img> keeps basePath handling explicit */
import { withBase } from "@/lib/routeFallback";

/* Photos: Unsplash stock placeholders (see public/images/photos/CREDITS.md).
   Icons: Microsoft Fluent Emoji 3D (MIT). */

export type EmojiName =
  | "graduation-cap" | "backpack" | "family" | "handshake" | "people" | "school" | "globe" | "calendar"
  | "briefcase" | "party" | "search" | "compass" | "video" | "phone" | "clipboard" | "lock" | "check"
  | "chat" | "hidden" | "shield" | "brain" | "rocket" | "books" | "airplane" | "pin" | "wave" | "star"
  | "heart" | "glow" | "play" | "gear" | "envelope" | "key" | "sparkles" | "megaphone" | "bulb" | "link"
  | "point" | "person" | "hourglass" | "mail" | "teacher" | "office" | "classical" | "hug";

export function Emoji({ name, size = 40, className = "" }: { name: EmojiName; size?: number; className?: string }) {
  return (
    <img
      src={withBase(`/images/emoji/${name}.png`)}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 select-none object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}


export const photo = (name: string) => withBase(`/images/photos/${name}.jpg`);
