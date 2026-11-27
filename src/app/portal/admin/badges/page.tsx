"use client";

import { useState } from "react";
import { PauseCircle, PlayCircle, Trash2, UserPlus } from "lucide-react";
import { AdminOnly, useScope } from "@/components/admin";
import { Avatar, Button, Callout, Card, Input, Modal, PageHeader, Pill, Req, Select, Tabs } from "@/components/ui";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { BadgeType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const LABEL: Record<BadgeType, string> = { Mentor: "Mentor", Recruiter: "Recruiter", ServiceProvider: "Service provider", ChapterLead: "Chapter Lead", Donor: "Donor" };

export default function BadgesAdminPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <BadgesAdmin />
    </AdminOnly>
  );
}

function BadgesAdmin() {
  const { me, state, setBadgeStatus, revokeBadge, appointChapterLead, setChapterLimit } = useStore();
  const { inScope, group } = useScope();
  const [tab, setTab] = useState<BadgeType>("ChapterLead");
  const [appoint, setAppoint] = useState(false);
  const [pick, setPick] = useState("");
  const [gkind, setGkind] = useState<"batch" | "campus">("batch");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  if (!me) return null;

  const holders = state.users.filter((u) => inScope(u.campusIds[0]) && u.badges?.some((b) => b.type === tab));
  const candidates = state.users.filter((u) => u.role === "ALU" && !u.deactivated && inScope(u.campusIds[0]) && (!q || u.name.toLowerCase().includes(q.toLowerCase()))).slice(0, 30);
  const count = (t: BadgeType) => state.users.filter((u) => inScope(u.campusIds[0]) && u.badges?.some((b) => b.type === t)).length;

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="§5.2 · §5.4" />}
        title="Badges"
        description={`Everyone holding a badge${group ? "" : ` at ${campusName(me.campusIds[0])}`}. Suspend instantly, reinstate, or remove; every change is logged. New badge requests arrive in Verification.`}
        actions={
          <Button onClick={() => { setAppoint(true); setErr(""); setPick(""); }}>
            <UserPlus className="h-4 w-4" /> Appoint Chapter Lead
          </Button>
        }
      />
      <div className="mb-5">
        <Tabs tabs={(Object.keys(LABEL) as BadgeType[]).map((t) => ({ id: t, label: LABEL[t], count: count(t) }))} value={tab} onChange={setTab} />
      </div>
      {tab === "ChapterLead" && (
        <Callout tone="info" className="mb-4" title="Announcement limit">
          Chapter Leads can post <b>{state.chapterMonthlyLimit}</b> announcements per group per month.
          {group ? (
            <span className="ml-2 inline-flex items-center gap-2">
              <Input type="number" min={0} max={30} className="w-20" value={state.chapterMonthlyLimit} onChange={(e) => setChapterLimit(Number(e.target.value), me.id)} aria-label="Monthly limit" />
            </span>
          ) : (
            " Set by the Group Alumni Office."
          )}
        </Callout>
      )}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-label uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {holders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No one holds this badge yet.
                </td>
              </tr>
            )}
            {holders.map((u) => {
              const b = u.badges!.find((x) => x.type === tab)!;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size={32} />
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-muted">
                          Batch {u.batch} · {campusName(u.campusIds[0])}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    Since {formatDate(b.since)}
                    {b.group && ` · ${b.group.startsWith("batch:") ? `Batch of ${b.group.split(":")[2]}` : "Campus group"}`}
                    {tab === "ServiceProvider" && u.listing && ` · ${u.listing.business}`}
                  </td>
                  <td className="px-4 py-3">{b.status === "active" ? <Pill tone="success">Active</Pill> : <Pill tone="danger">Suspended</Pill>}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {b.status === "active" ? (
                        <Button size="sm" variant="secondary" onClick={() => setBadgeStatus(u.id, tab, "suspended", me.id)} title="Suspend now">
                          <PauseCircle className="h-4 w-4" /> Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => setBadgeStatus(u.id, tab, "active", me.id)} title="Reinstate">
                          <PlayCircle className="h-4 w-4" /> Reinstate
                        </Button>
                      )}
                      {tab !== "Donor" && (
                        <Button size="sm" variant="ghost" className="text-danger" onClick={() => revokeBadge(u.id, tab, me.id)} aria-label={`Remove ${LABEL[tab]} from ${u.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal
        open={appoint}
        onClose={() => setAppoint(false)}
        title="Appoint a Chapter Lead"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAppoint(false)}>
              Cancel
            </Button>
            <Button
              disabled={!pick}
              onClick={() => {
                const u = state.users.find((x) => x.id === pick);
                if (!u) return;
                const gid = gkind === "batch" ? `batch:${u.campusIds[0]}:${u.batch}` : `campus:${u.campusIds[0]}`;
                const r = appointChapterLead(u.id, gid, me.id);
                if (r.ok) { setAppoint(false); setTab("ChapterLead"); } else setErr(r.error ?? "");
              }}
            >
              Appoint
            </Button>
          </>
        }
      >
        <Input placeholder="Search verified alumni" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search alumni" />
        <Select className="mt-3" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Alumnus">
          <option value="">Choose…</option>
          {candidates.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} · Batch {u.batch} · {campusName(u.campusIds[0])}
            </option>
          ))}
        </Select>
        <Select className="mt-3" value={gkind} onChange={(e) => setGkind(e.target.value as "batch" | "campus")} aria-label="Group">
          <option value="batch">Their batch group</option>
          <option value="campus">Their campus alumni group</option>
        </Select>
        <p className="mt-2 text-label text-muted">They can only lead their own batch or campus group. They get an email.</p>
        {err && <p className="mt-2 text-sm font-semibold text-danger">{err}</p>}
      </Modal>
    </>
  );
}
