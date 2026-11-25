"use client";

import { useState } from "react";
import { CheckCircle2, Copy, GitMerge } from "lucide-react";
import { AdminOnly, NoPermission } from "@/components/admin";
import { Avatar, Button, Callout, Card, Empty, Modal, PageHeader, Pill, Req } from "@/components/ui";
import { campusName } from "@/lib/data";
import { findDuplicates, type DuplicatePair } from "@/lib/admin";
import { completeness } from "@/lib/community";
import { can, useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const FIELDS: { key: keyof User; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "title", label: "Job title" },
  { key: "city", label: "City" },
  { key: "college", label: "College" },
  { key: "field", label: "Industry" },
];

export default function DuplicatesPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <Duplicates />
    </AdminOnly>
  );
}

function Duplicates() {
  const { me, state } = useStore();
  const [open, setOpen] = useState<DuplicatePair | null>(null);
  const [notDupes, setNotDupes] = useState<string[]>([]);
  if (!me) return null;
  const pairs = findDuplicates(state.users).filter((p) => !notDupes.includes(`${p.a.id}|${p.b.id}`));
  const allowed = can(state, me, "duplicates.merge");

  return (
    <>
      <PageHeader eyebrow={<Req ids="L4 · DM-3" />} title="Duplicate records" description="People who seem to have two records, for example one from the old portal and one from signing up again." />
      {!allowed && (
        <Callout tone="warning" className="mb-4">
          Your role can see possible duplicates but not merge them. A Super Admin can change this in Permissions.
        </Callout>
      )}
      {pairs.length === 0 ? (
        <Card>
          <Empty icon={<CheckCircle2 className="h-6 w-6" />} title="No likely duplicates">
            We check name, email, mobile, campus and batch every time records change.
          </Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {pairs.map((p) => (
            <Card key={`${p.a.id}|${p.b.id}`} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={p.score >= 90 ? "danger" : "warning"}>{p.score}% match</Pill>
                {p.reasons.map((r) => (
                  <Pill key={r}>{r}</Pill>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[p.a, p.b].map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                    <Avatar name={u.name} size={40} />
                    <div className="min-w-0 text-[13px]">
                      <p className="truncate font-semibold">{u.name}</p>
                      <p className="truncate text-muted">{u.email}</p>
                      <p className="truncate text-muted">
                        Batch {u.batch} · {campusName(u.campusIds[0])} · profile {completeness(u)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setNotDupes([...notDupes, `${p.a.id}|${p.b.id}`])}>
                  Not the same person
                </Button>
                {allowed ? (
                  <Button size="sm" onClick={() => setOpen(p)}>
                    <GitMerge className="h-4 w-4" /> Review & merge
                  </Button>
                ) : (
                  <NoPermission what="merge records" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && <MergeModal pair={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function MergeModal({ pair, onClose }: { pair: DuplicatePair; onClose: () => void }) {
  const { me, mergeUsers, state } = useStore();
  // suggest keeping the more complete record (or the one with more history)
  const history = (u: User) => state.posts.filter((p) => p.authorId === u.id).length + state.engagements.filter((e) => e.alumniId === u.id).length;
  const first = completeness(pair.a) + history(pair.a) >= completeness(pair.b) + history(pair.b) ? pair.a : pair.b;
  const [keepId, setKeepId] = useState(first.id);
  const keep = keepId === pair.a.id ? pair.a : pair.b;
  const drop = keepId === pair.a.id ? pair.b : pair.a;
  const [pick, setPick] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, keep[f.key] ? keep.id : drop[f.key] ? drop.id : keep.id]))
  );

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title="Merge two records"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const chosen = Object.fromEntries(FIELDS.map((f) => [f.key, (pick[f.key] === pair.a.id ? pair.a : pair.b)[f.key]])) as Partial<User>;
              mergeUsers(keep.id, drop.id, chosen, me!.id);
              onClose();
            }}
          >
            <GitMerge className="h-4 w-4" /> Merge into one
          </Button>
        </>
      }
    >
      <p className="mb-3 text-[13px] text-muted">Pick the correct value for each field. Posts, chats, job interest, RSVPs, invites and engagement history move to the record you keep.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13px]">
          <thead>
            <tr className="text-left text-[12px] text-muted">
              <th className="py-2 pr-3 font-semibold">Field</th>
              {[pair.a, pair.b].map((u) => (
                <th key={u.id} className="py-2 pr-3">
                  <label className="flex items-center gap-2 font-semibold text-text">
                    <input type="radio" name="keep" checked={keepId === u.id} onChange={() => setKeepId(u.id)} className="accent-[var(--primary)]" />
                    Keep this record
                  </label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FIELDS.map((f) => (
              <tr key={f.key}>
                <td className="py-2 pr-3 font-medium text-muted">{f.label}</td>
                {[pair.a, pair.b].map((u) => {
                  const v = u[f.key] as string | undefined;
                  const same = pair.a[f.key] === pair.b[f.key];
                  return (
                    <td key={u.id} className="py-1.5 pr-3">
                      <button
                        type="button"
                        disabled={!v || same}
                        onClick={() => setPick({ ...pick, [f.key]: u.id })}
                        className={cn(
                          "w-full rounded-lg border px-2.5 py-1.5 text-left",
                          same ? "border-transparent text-muted" : pick[f.key] === u.id ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border hover:bg-surface-2",
                          !v && "opacity-40"
                        )}
                      >
                        {v || "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
        <Copy className="h-3.5 w-3.5" /> The other record is removed. Its ID is kept on the merged record for traceability.
      </p>
    </Modal>
  );
}
