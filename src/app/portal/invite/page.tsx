"use client";

import { check, clean, normalizeMobile, whenFilled } from "@/lib/validate";
import { useState } from "react";
import { Copy, Mail, MessageCircle, Send, Trophy } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Card, CardHeader, Field, Input, PageHeader, Pill, Req } from "@/components/ui";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

export default function InvitePage() {
  return (
    <Gate roles={["ALU"]}>
      <Invite />
    </Gate>
  );
}

function Invite() {
  const { me, state, sendInvite } = useStore();
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [to, setTo] = useState("");
  const [copied, setCopied] = useState(false);
  if (!me) return null;

  const toErr = channel === "email" ? check.email(to) : check.mobile(to);
  const valid = !toErr;
  const mine = state.invites.filter((i) => i.by === me.id);
  const board = Object.entries(
    state.invites.reduce<Record<string, { sent: number; joined: number }>>((acc, i) => {
      acc[i.by] ??= { sent: 0, joined: 0 };
      acc[i.by].sent++;
      if (i.joined) acc[i.by].joined++;
      return acc;
    }, {})
  )
    .map(([id, v]) => ({ u: state.users.find((x) => x.id === id), ...v }))
    .filter((x) => x.u)
    .sort((a, b) => b.joined - a.joined || b.sent - a.sent)
    .slice(0, 8);
  const link = `vaa.vibgyor.in/join?ref=${me.id}`;

  return (
    <>
      <PageHeader eyebrow={<Req ids="C11" />} title="Invite friends" description="Bring your batchmates to VAA. Every invite links to the join page, so they still go through verification." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Send an invite" />
            <form
              className="space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                sendInvite(me.id, channel === "email" ? to.trim() : normalizeMobile(to), channel);
                setTo("");
              }}
            >
              <div className="flex gap-2">
                {(
                  [
                    ["email", "Email", Mail],
                    ["whatsapp", "WhatsApp", MessageCircle],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => { setChannel(id); setTo(""); }}
                    className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-body font-semibold", channel === id ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-2")}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
              <Field label={channel === "email" ? "Their email" : "Their WhatsApp number"} htmlFor="to" error={whenFilled(to, toErr)}>
                <Input id="to" type={channel === "email" ? "email" : "tel"} value={to} invalid={!!whenFilled(to, toErr)} onChange={(e) => setTo(channel === "email" ? clean.email(e.target.value) : clean.mobile(e.target.value))} placeholder={channel === "email" ? "friend@example.com" : "+91 98XXX XXXXX"} />
              </Field>
              <Button type="submit" disabled={!valid}>
                <Send className="h-4 w-4" /> Send invite
              </Button>
            </form>
            <div className="flex flex-col gap-2 border-t border-border p-5 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 truncate rounded-xl bg-surface-2 px-3 py-2 font-mono text-sm">{link}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Your invites" subtitle={`${mine.filter((i) => i.joined).length} of ${mine.length} joined`} />
            {mine.length === 0 ? (
              <p className="p-5 text-body text-muted">No invites yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {mine.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 px-5 py-3 text-body">
                    {i.channel === "email" ? <Mail className="h-4 w-4 text-muted" /> : <MessageCircle className="h-4 w-4 text-muted" />}
                    <span className="min-w-0 flex-1 truncate">{i.to}</span>
                    <span className="text-label text-muted">{timeAgo(i.at)}</span>
                    {i.joined ? <Pill tone="success">Joined</Pill> : <Pill>Invited</Pill>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Top inviters" subtitle="People whose invites turned into members" icon={<Trophy className="h-5 w-5" />} />
          <ol className="divide-y divide-border">
            {board.map((b, i) => (
              <li key={b.u!.id} className={cn("flex items-center gap-3 px-5 py-3", b.u!.id === me.id && "bg-primary-soft/40")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-label font-semibold", i === 0 ? "bg-warning-soft text-warning" : "bg-surface-2 text-muted")}>{i + 1}</span>
                <Avatar name={b.u!.name} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold">{b.u!.id === me.id ? "You" : b.u!.name}</span>
                  <span className="block truncate text-label text-muted">
                    Batch {b.u!.batch} · {campusName(b.u!.campusIds[0])}
                  </span>
                </span>
                <span className="text-right text-label">
                  <span className="block text-body font-semibold tabular-nums">{b.joined}</span>
                  <span className="text-muted">joined</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
