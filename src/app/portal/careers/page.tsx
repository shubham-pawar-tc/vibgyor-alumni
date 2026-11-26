"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Button, Callout, Card, CardHeader, Empty, Input, PageHeader, Pill, Req, Tabs } from "@/components/ui";
import { MCZ_SESSION_FEE } from "@/lib/data";
import { bookingStatus, rupees } from "@/lib/labels";
import { hasConsent, useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { firstName, formatDateTime } from "@/lib/utils";

export default function CareersPage() {
  return (
    <Gate roles={["STU", "PAR"]}>
      <Careers />
    </Gate>
  );
}

function Careers() {
  const { me, state, bookMcz } = useStore();
  const kids = me?.role === "PAR" ? (me.childIds ?? []).map((id) => state.users.find((u) => u.id === id)).filter((u): u is User => !!u) : me ? [me] : [];
  const [kid, setKid] = useState(kids[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [slot, setSlot] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!me) return null;
  const parent = me.role === "PAR";
  const stu = kids.find((k) => k.id === kid) ?? kids[0];
  if (!stu) return null;
  const consent = hasConsent(state, stu.id, "mcz");
  const active = stu.studentStatus === "active";
  const list = state.bookings.filter((b) => b.studentId === stu.id);

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="MCZ · cond. 17" />}
        title="MyCareerZ sessions"
        description={parent ? "Book a one-to-one career session with a MyCareerZ counsellor for your child." : "Ask for a one-to-one career session with a MyCareerZ counsellor."}
      />
      {kids.length > 1 && (
        <div className="mb-5">
          <Tabs tabs={kids.map((k) => ({ id: k.id, label: firstName(k.name) }))} value={stu.id} onChange={(v) => { setKid(v); setMsg(null); }} />
        </div>
      )}
      {!active || !consent ? (
        <Callout tone="warning" title={!active ? `${parent ? firstName(stu.name) + "'s" : "Your"} account isn't active yet` : "MyCareerZ sharing is switched off"}>
          {!active ? "A parent needs to give consent first." : parent ? `Switch on "MyCareerZ" for ${firstName(stu.name)} in the Consent centre to book.` : "Ask your parent to switch on MyCareerZ in their Consent centre."}
          {parent && active && (
            <div className="mt-3">
              <Button size="sm" href={`/portal/consent?child=${stu.id}`}>
                Open consent centre
              </Button>
            </div>
          )}
        </Callout>
      ) : (
        <Card className="mb-5 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="What would you like help with?" value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic" />
            <Input type="datetime-local" value={slot} onChange={(e) => setSlot(e.target.value)} aria-label="Preferred time" />
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              const r = bookMcz({ studentId: stu.id, bookedBy: me.id, topic, slot: slot ? new Date(slot).toISOString() : "" });
              setMsg(r.ok ? { ok: true, text: parent ? `Booked and paid ${rupees(MCZ_SESSION_FEE)}. The counsellor will confirm the time.` : "Request sent. The counsellor will confirm with your parent." } : { ok: false, text: r.error ?? "" });
              if (r.ok) { setTopic(""); setSlot(""); }
            }}
          >
            {parent ? `Book and pay ${rupees(MCZ_SESSION_FEE)} (demo payment)` : "Request a session"}
          </Button>
          {msg && <p className={`mt-3 text-[14px] font-semibold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
        </Card>
      )}
      <Card>
        <CardHeader title="Sessions" icon={<Compass className="h-5 w-5" />} />
        {list.length === 0 ? (
          <Empty title="No sessions yet" />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                <span>
                  <b>{b.topic}</b> {b.slot && <span className="text-muted">· {formatDateTime(b.slot)}</span>}
                </span>
                <Pill tone={bookingStatus[b.status].tone}>{bookingStatus[b.status].label}</Pill>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
