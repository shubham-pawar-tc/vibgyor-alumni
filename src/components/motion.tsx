"use client";

/**
 * Motion primitives — the only place animation is defined.
 *
 * Timings (see also the --dur-* tokens in globals.css):
 *   micro-interactions 150–200ms · page transitions 250ms · section reveals 500ms
 * Easing is a natural deceleration; nothing bounces, spins or parallaxes.
 * <MotionProvider> sets reducedMotion="user": with the OS setting on, Motion
 * drops transform animations and keeps only short opacity fades.
 */

import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.15, base: 0.2, page: 0.25, reveal: 0.5, chart: 0.7 } as const;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.base, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

/* ---------------------------------------------------------- Scroll reveal */

const revealTags = { div: motion.div, li: motion.li, section: motion.section };

/** Fades a block up 12px the first time it scrolls into view. Use on sections, not on every element. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  /** milliseconds */
  delay?: number;
  className?: string;
  as?: keyof typeof revealTags;
}) {
  const Tag = revealTags[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: DUR.reveal, ease: EASE, delay: delay / 1000 }}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------- Hero entrance */

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.reveal, ease: EASE } },
};

/** Staggered entrance on first paint, for hero copy. Wrap lines in <EnterItem>. */
export function Enter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function EnterItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "p" | "h1" }) {
  const Tag = as === "h1" ? motion.h1 : as === "p" ? motion.p : motion.div;
  return (
    <Tag className={className} variants={staggerChild}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------- Page transition */

/** Route-level fade. Key it by pathname so each page enters once. */
export function PageTransition({ children, routeKey, className }: { children: React.ReactNode; routeKey: string; className?: string }) {
  return (
    <motion.div
      key={routeKey}
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.page, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------- Dropdown */

/** Menu surface that fades and settles from 4px above. Position it with className. */
export function Dropdown({ open, className, children, origin = "top right" }: { open: boolean; className?: string; children: React.ReactNode; origin?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={className}
          style={{ transformOrigin: origin }}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: DUR.fast } }}
          transition={{ duration: DUR.base, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------- Drawer */

/** Off-canvas panel from the left with a dimmed backdrop (mobile sidebar). */
export function Drawer({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-[rgb(10_16_28/0.5)]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base }}
        >
          <motion.aside
            className={className}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: DUR.page, ease: EASE }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------- Charts */

/**
 * Horizontal progress/bar mark that grows from zero the first time it is seen.
 * `index` staggers sibling bars by 60ms so a chart reads top to bottom.
 */
export function AnimatedBar({ value, className, trackClassName, index = 0, label }: { value: number; className?: string; trackClassName?: string; index?: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion(); // width isn't a transform, so opt out explicitly
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      ref={ref}
      className={cn("h-2 overflow-hidden rounded-full bg-surface-2", trackClassName)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cn("h-full rounded-full bg-primary", className)}
        initial={{ width: 0 }}
        animate={{ width: seen ? `${pct}%` : 0 }}
        transition={reduce ? { duration: 0 } : { duration: DUR.chart, ease: EASE, delay: index * 0.06 }}
      />
    </div>
  );
}
