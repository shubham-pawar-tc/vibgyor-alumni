"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Callout, Card, CardHeader, Empty, Field, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { hasConsent, useStore } from "@/lib/store";
import type { Booking } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const statusLabel: Record<Booking["status"], string> = {
  referred: "Referred · waiting for MyCareerZ",
  requested: "Requested",
  confirmed: "Session booked",
  done: "Session done",
  cancelled: "Cancelled",
};
const statusTone: Record<Booking["status"], "warning" | "info" | "success" | "neutral"> = {
  referred: "warning",
  requested: "info",
  confirmed: "success",
  done: "success",
  cancelled: "neutral",
};

const topics = ["University shortlist (abroad)", "Colleges in India", "Choosing a stream", "Entrance exam planning"];

export default function TeacherReferPage() {
  return (
    <Gate roles={["TCH"]}>
      <Refer />
    </Gate>
  );
}

function Refer() {
  const { me, state, referToMcz } = useStore();
  const [studentId, setStudentId] = useState("");
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!me) return null;

  const students = state.users.filter((u) => u.role === "STU" && u.studentStatus === "active" && me.campusIds.includes(u.campusIds[0]));
  const consented = students.filter((u) => hasConsent(state, u.id, "mcz"));
  const mine = state.bookings.filter((b) => b.bookedBy === me.id).sort((a, b) => b.at.localeCompare(a.at));

  const submit = () => {
    const r = referToMcz(studentId, me.id, topic, note);
    if (r.ok) {
      setMsg({ ok: true, text: "Referred. A MyCareerZ counsellor will contact the parent to book a session." });
      setStudentId("");
      setTopic("");
      setNote("");
    } else setMsg({ ok: false, text: r.error ?? "Couldn't refer this student." });
  };

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="MCZ · cond. 18 · CS-3" />}
        title="Refer to MyCareerZ"
        description={`Refer a student at ${campusName(me.campusIds[0])} to a MyCareerZ career counsellor. MyCareerZ contacts the parent, never the student.`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="p-5">
          <CardHeader icon={<Compass className="h-5 w-5" />} title="New referral" subtitle={`${consented.length} of ${students.length} students have MyCareerZ consent`} />
          <div className="mt-4 space-y-4">
            <Field label="Student" htmlFor="ref-student" hint="Only students whose parent switched on MyCareerZ sharing can be referred.">
              <Select id="ref-student" value={studentId} onChange={(e) => { setStudentId(e.target.value); setMsg(null); }}>
                <option value="">Choose a student…</option>
                {students.map((u) => {
                  const ok = hasConsent(state, u.id, "mcz");
                  return (
                    <option key={u.id} value={u.id} disabled={!ok}>
                      {u.name} · Class {u.className}{ok ? "" : " · no MyCareerZ consent"}
                    </option>
                  );
                })}
              </Select>
            </Field>
            <Field label="Topic" htmlFor="ref-topic">
              <Select id="ref-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">Choose a topic…</option>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Note for the counsellor (optional)" htmlFor="ref-note">
              <Textarea id="ref-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Strong in maths, unsure between engineering and economics." />
            </Field>
            {msg && (
              <Callout tone={msg.ok ? "success" : "warning"} title={msg.ok ? "Referral sent" : "Not sent"}>
                {msg.text}
              </Callout>
            )}
            <Button disabled={!studentId || !topic} onClick={submit}>
              <Compass className="h-4 w-4" /> Refer
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Your referrals" subtitle="Status updates as MyCareerZ books and runs the session." />
          {mine.length === 0 ? (
            <Empty title="No referrals yet">Students you refer appear here with their booking status.</Empty>
          ) : (
            <ul className="mt-4 space-y-3">
              {mine.map((b) => {
                const stu = state.users.find((u) => u.id === b.studentId);
                return (
                  <li key={b.id} className="flex flex-wrap items-start gap-3 rounded-xl bg-surface-2 p-3">
                    <Avatar name={stu?.name ?? "?"} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {stu?.name ?? "Student"} <span className="font-normal text-muted">· Class {stu?.className}</span>
                      </p>
                      <p className="text-sm">
                        {b.topic} <span className="text-muted">· {timeAgo(b.at)}</span>
                      </p>
                      {b.note && <p className="mt-1 text-label text-muted">Your note: {b.note}</p>}
                    </div>
                    <Pill tone={statusTone[b.status]}>{statusLabel[b.status]}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
