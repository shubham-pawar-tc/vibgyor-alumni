"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle, Plus, Search, Send } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Card, Empty, Input, Modal, PageHeader, Req } from "@/components/ui";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";

export default function ChatsPage() {
  return (
    <Gate roles={["ALU"]}>
      <Suspense>
        <Chats />
      </Suspense>
    </Gate>
  );
}

function Chats() {
  const { me, state, sendDm, openDm } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [text, setText] = useState("");
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const threads = state.dmThreads
    .filter((t) => me && t.members.includes(me.id))
    .map((t) => {
      const msgs = state.dms.filter((m) => m.threadId === t.id);
      const other = state.users.find((u) => u.id === t.members.find((x) => x !== me?.id));
      return { t, msgs, other, last: msgs.at(-1) };
    })
    .sort((a, b) => Date.parse(b.last?.at ?? b.t.createdAt) - Date.parse(a.last?.at ?? a.t.createdAt));

  const activeId = params.get("t") ?? undefined;
  const active = threads.find((x) => x.t.id === activeId);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [active?.msgs.length]);

  if (!me) return null;

  const people = state.users.filter((u) => u.role === "ALU" && u.id !== me.id && (!q || u.name.toLowerCase().includes(q.toLowerCase()))).slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="D1" />}
        title="Chats"
        description="One-to-one messages with other verified alumni."
        actions={
          <Button onClick={() => setPicker(true)}>
            <Plus className="h-4 w-4" /> New chat
          </Button>
        }
      />
      <Card className="grid h-[calc(100vh-230px)] min-h-[460px] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
        {/* thread list */}
        <div className={cn("min-h-0 overflow-y-auto border-border md:border-r", active && "hidden md:block")}>
          {threads.length === 0 ? (
            <Empty icon={<MessageCircle className="h-6 w-6" />} title="No chats yet">
              Find someone in the directory and press Message.
            </Empty>
          ) : (
            threads.map(({ t, other, last }) => (
              <Link
                key={t.id}
                href={`/portal/chats?t=${t.id}`}
                className={cn("flex items-center gap-3 border-b border-border px-4 py-3 hover:bg-surface-2", t.id === activeId && "bg-primary-soft/50")}
              >
                <Avatar name={other?.name ?? "?"} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold">{other?.name}</p>
                    {last && <span className="shrink-0 text-[11px] text-muted">{timeAgo(last.at)}</span>}
                  </div>
                  <p className="truncate text-[12.5px] text-muted">{last ? `${last.senderId === me.id ? "You: " : ""}${last.text}` : "Say hello 👋"}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* conversation */}
        <div className={cn("flex min-h-0 flex-col", !active && "hidden md:flex")}>
          {!active ? (
            <div className="grid flex-1 place-items-center">
              <Empty icon={<MessageCircle className="h-6 w-6" />} title="Pick a chat" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button className="md:hidden" onClick={() => router.push("/portal/chats")} aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar name={active.other?.name ?? "?"} size={36} />
                <div className="min-w-0 flex-1">
                  <Link href={`/portal/people/${active.other?.id}`} className="block truncate text-[14px] font-semibold hover:underline">
                    {active.other?.name}
                  </Link>
                  <p className="truncate text-[12px] text-muted">
                    Batch {active.other?.batch} · {campusName(active.other?.campusIds[0])}
                  </p>
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-surface-2/50 px-4 py-4">
                {active.msgs.length === 0 && <p className="py-6 text-center text-[13px] text-muted">This is the start of your chat with {active.other?.name}.</p>}
                {active.msgs.map((m) => {
                  const mine = m.senderId === me.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px]", mine ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md bg-surface shadow-sm")}>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <p className={cn("mt-0.5 text-[10.5px]", mine ? "text-primary-fg/70" : "text-muted")}>{formatDateTime(m.at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottom} />
              </div>
              <form
                className="flex gap-2 border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  sendDm(active.t.id, me.id, text);
                  setText("");
                }}
              >
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${active.other?.name.split(" ")[0]}`} />
                <Button type="submit" disabled={!text.trim()} aria-label="Send">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>

      <Modal open={picker} onClose={() => setPicker(false)} title="Start a chat">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input className="pl-9" autoFocus placeholder="Search alumni by name" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="space-y-1">
          {people.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                const t = openDm(me.id, u.id);
                setPicker(false);
                router.push(`/portal/chats?t=${t}`);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
            >
              <Avatar name={u.name} size={34} />
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold">{u.name}</span>
                <span className="block truncate text-[12px] text-muted">
                  Batch {u.batch} · {campusName(u.campusIds[0])}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
