"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Mail, MessageCircle, MessageSquareText, Smartphone, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Channel } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const channelMeta: Record<Channel, { label: string; icon: typeof Mail; cls: string }> = {
  sms: { label: "SMS", icon: MessageSquareText, cls: "bg-info-soft text-info" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, cls: "bg-success-soft text-success" },
  email: { label: "Email", icon: Mail, cls: "bg-warning-soft text-warning" },
  push: { label: "Push", icon: Bell, cls: "bg-primary-soft text-primary" },
};

/**
 * Demo-only "device simulator": shows the SMS, WhatsApp, email and push
 * messages the platform would send, so OTPs and links can be followed live.
 */
export function OutboxWidget() {
  const { state, hydrated, clearOutbox } = useStore();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(-1);

  const count = state.outbox.length;
  useEffect(() => {
    if (!hydrated) return;
    if (prev.current === -1) {
      prev.current = count;
      setSeen(count);
      return;
    }
    if (count > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2400);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count, hydrated]);

  useEffect(() => {
    if (open) setSeen(count);
  }, [open, count]);

  if (!hydrated) return null;
  const unread = Math.max(0, count - seen);
  const latest = state.outbox[0];

  return (
    <>
      {/* toast for newest message */}
      {pulse && latest && !open && (
        <button
          onClick={() => setOpen(true)}
          className="animate-in fixed bottom-24 right-4 z-40 w-[min(340px,calc(100vw-32px))] rounded-2xl border border-border bg-surface p-3.5 text-left shadow-2xl"
        >
          <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-muted">
            <ChannelIcon ch={latest.channel} />
            {channelMeta[latest.channel].label} sent · {latest.to}
          </div>
          <p className="line-clamp-2 text-[13px]">{latest.body}</p>
        </button>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-text px-4 text-[13px] font-semibold text-bg shadow-2xl transition-transform hover:scale-[1.03]",
          pulse && "ring-4 ring-primary/40"
        )}
        aria-label="Open device simulator"
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden sm:inline">Device simulator</span>
        {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] text-white">{unread}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setOpen(false)}>
          <aside
            className="animate-in flex h-full w-full max-w-[400px] flex-col border-l border-border bg-bg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
              <div>
                <p className="font-semibold">Device simulator</p>
                <p className="text-[12px] text-muted">Messages the platform would send · demo only</p>
              </div>
              <div className="flex gap-1">
                <button onClick={clearOutbox} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2" aria-label="Clear">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {state.outbox.length === 0 && (
                <div className="px-6 py-16 text-center text-[13px] text-muted">
                  <Smartphone className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  Nothing sent yet. OTP codes, consent links and broadcast previews appear here.
                </div>
              )}
              {state.outbox.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-surface p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold">
                      <ChannelIcon ch={m.channel} />
                      <span className="truncate">{m.to}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">{timeAgo(m.at)}</span>
                  </div>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed">{highlightOtp(m.body)}</p>
                  {m.link && (
                    <Link
                      href={m.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-2.5 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[12px] font-semibold text-primary-fg"
                    >
                      {m.link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function ChannelIcon({ ch }: { ch: Channel }) {
  const M = channelMeta[ch];
  return (
    <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", M.cls)}>
      <M.icon className="h-3.5 w-3.5" />
    </span>
  );
}

function highlightOtp(text: string) {
  const m = text.match(/^(\d{6})(.*)$/s);
  if (!m) return text;
  return (
    <>
      <span className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[15px] font-bold tracking-widest text-primary">{m[1]}</span>
      {m[2]}
    </>
  );
}
