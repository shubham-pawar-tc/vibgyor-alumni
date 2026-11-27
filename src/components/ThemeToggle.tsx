"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Theme switching for the whole app.
 *
 * - The choice is saved in localStorage under `vaa-theme` and applied as
 *   `data-theme` on <html> by an inline script in app/layout.tsx before first
 *   paint, so there is no flash of the wrong theme on any route.
 * - With nothing saved, the OS setting wins and is followed live.
 * - Every toggle on the page stays in sync via a custom event.
 */
export const THEME_KEY = "vaa-theme";
const EVENT = "vaa-theme-change";
type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let fadeTimer: ReturnType<typeof setTimeout> | undefined;

export function setTheme(next: Theme) {
  const root = document.documentElement;
  // Cross-fade colours for 200ms (skipped when the user prefers reduced motion).
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition");
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove("theme-transition"), 260);
  }
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, set] = useState<Theme>("light");
  useEffect(() => {
    const sync = () => set(currentTheme());
    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener(EVENT, sync);
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      mq.removeEventListener("change", sync);
    };
  }, []);
  return [theme, setTheme];
}

export function ThemeToggle() {
  const [theme, change] = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => change(dark ? "light" : "dark")}
      className="ds-interactive ds-press relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg text-muted hover:bg-surface-2 hover:text-text"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="grid place-items-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
