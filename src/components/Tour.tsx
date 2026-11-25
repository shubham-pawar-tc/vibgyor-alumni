"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Eye, MapPin, MousePointerClick, X } from "lucide-react";
import { roleLabels } from "@/lib/data";
import { useStore } from "@/lib/store";
import { tours, type TourStep } from "@/lib/tours";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";

const KEY = "vaa-tour";

interface TourState {
  tourId: number;
  step: number;
}

interface TourCtx {
  active: TourState | null;
  start: (tourId: number) => void;
  stop: () => void;
}

const Ctx = createContext<TourCtx | null>(null);

export function useTour() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTour outside TourProvider");
  return c;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, reset, hydrated, me, state } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<TourState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [min, setMin] = useState(false);
  const lastMove = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setActive(JSON.parse(raw));
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (active) localStorage.setItem(KEY, JSON.stringify(active));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [active, mounted]);

  const goTo = useCallback(
    (step: TourStep) => {
      if (step.as === null) logout();
      else if (step.as) login(step.as);
      const target = step.path.split("?")[0];
      if (pathname === target) {
        // same page: reload so the page starts fresh
        setTimeout(() => window.location.assign(step.path), 150);
      } else {
        router.push(step.path);
      }
    },
    [login, logout, pathname, router]
  );

  const start = useCallback(
    (tourId: number) => {
      reset();
      const t = tours.find((x) => x.id === tourId)!;
      setActive({ tourId, step: 0 });
      setMin(false);
      setTimeout(() => goTo(t.steps[0]), 50);
    },
    [reset, goTo]
  );

  const stop = useCallback(() => setActive(null), []);

  const tour = active ? tours.find((t) => t.id === active.tourId) : undefined;
  const step = tour && active ? tour.steps[active.step] : undefined;
  const total = tour?.steps.length ?? 0;
  const isLast = active ? active.step === total - 1 : false;

  const move = (delta: number) => {
    if (!tour || !active) return;
    // guard against double clicks / repeated events advancing several steps
    const now = Date.now();
    if (now - lastMove.current < 700) return;
    lastMove.current = now;
    const next = active.step + delta;
    if (next < 0 || next >= total) return;
    setActive({ ...active, step: next });
    const s = tour.steps[next];
    // switch person / page automatically when the step needs it
    const needSwitch = (s.as !== undefined && (s.as === null ? !!me : me?.id !== s.as)) || pathname !== s.path.split("?")[0];
    if (needSwitch) goTo(s);
  };

  // who the step is about
  const whoId = step?.as === null ? null : (step?.as ?? me?.id);
  const who = whoId && !step?.path.startsWith("/consent") ? state.users.find((u) => u.id === whoId) : undefined;

  return (
    <Ctx.Provider value={{ active, start, stop }}>
      {children}
      {mounted && hydrated && tour && step && active && (
        <div
          className={cn(
            "animate-in fixed inset-x-3 bottom-20 z-40 overflow-hidden rounded-2xl border-2 border-primary bg-surface shadow-2xl sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[380px]",
            pathname.startsWith("/portal") && "lg:left-[284px]"
          )}
          role="region"
          aria-label="Guided tour"
        >
          {/* header */}
          <div className="flex items-center gap-2 bg-primary px-4 py-2.5 text-primary-fg">
            <MapPin className="h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">
              Tour {tour.id}: {tour.title}
            </p>
            <span className="shrink-0 text-[12px] font-semibold opacity-90">
              {active.step + 1}/{total}
            </span>
            <button onClick={() => setMin(!min)} className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/15" aria-label={min ? "Expand" : "Minimise"}>
              {min ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button onClick={stop} className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/15" aria-label="End tour">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* progress */}
          <div className="flex gap-1 px-4 pt-3">
            {tour.steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= active.step ? "bg-primary" : "bg-border")} />
            ))}
          </div>

          {!min && (
            <div className="space-y-3 px-4 pb-4 pt-3">
              <p className="text-[16px] font-bold leading-snug">{step.title}</p>

              {/* who */}
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2">
                {who ? <Avatar name={who.name} size={28} /> : <span className="grid h-7 w-7 place-items-center rounded-full bg-border text-[11px] font-bold">?</span>}
                <p className="text-[12.5px]">
                  <span className="text-muted">You are: </span>
                  <span className="font-semibold">{who ? `${who.name} · ${roleLabels[who.role]}` : step.path.startsWith("/consent") ? "Neha Mehta · Parent (on her phone)" : "A visitor (not signed in)"}</span>
                </p>
              </div>

              {/* do this */}
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-primary">
                  <MousePointerClick className="h-3.5 w-3.5" /> Do this
                </p>
                <ol className="space-y-1.5">
                  {step.doThis.map((d, i) => (
                    <li key={i} className="flex gap-2 text-[13.5px] leading-snug">
                      <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">{i + 1}</span>
                      {d}
                    </li>
                  ))}
                </ol>
              </div>

              {/* notice */}
              <div className="flex gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12.5px] leading-snug text-muted">
                <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <b className="text-text">Why it matters: </b>
                  {step.notice}
                </span>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => move(-1)}
                  disabled={active.step === 0}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border hover:bg-surface-2 disabled:opacity-40"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button onClick={() => goTo(step)} className="h-10 flex-1 rounded-xl border border-border px-3 text-[13px] font-semibold hover:bg-surface-2">
                  Take me there
                </button>
                {isLast ? (
                  <button onClick={() => Date.now() - lastMove.current > 700 && stop()} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success px-3 text-[13px] font-semibold text-white">
                    <Check className="h-4 w-4" /> Finish
                  </button>
                ) : (
                  <button onClick={() => move(1)} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[13px] font-semibold text-primary-fg hover:bg-primary-hover">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}
