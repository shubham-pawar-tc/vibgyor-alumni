"use client";

import { useState } from "react";
import { AdminOnly, useScope } from "@/components/admin";
import { Button, Card, Empty, PageHeader, Pill, Req, Tabs } from "@/components/ui";
import { campusName } from "@/lib/data";
import { docStatus, rupees } from "@/lib/labels";
import { useStore } from "@/lib/store";
import type { DocRequest } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const NEXT: Partial<Record<DocRequest["status"], { to: DocRequest["status"]; label: string }>> = {
  paid: { to: "processing", label: "Start preparing" },
  processing: { to: "ready", label: "Mark ready" },
  ready: { to: "dispatched", label: "Mark sent / collected" },
};

export default function DocumentsAdminPage() {
  const { me } = useStore();
  return (
    <AdminOnly me={me}>
      <DocsAdmin />
    </AdminOnly>
  );
}

function DocsAdmin() {
  const { me, state, advanceDocument } = useStore();
  const { inScope, group } = useScope();
  const [tab, setTab] = useState<"todo" | "unpaid" | "done">("todo");
  if (!me) return null;
  const all = state.docRequests.filter((r) => inScope(r.campusId));
  const sets = { todo: all.filter((r) => ["paid", "processing", "ready"].includes(r.status)), unpaid: all.filter((r) => r.status === "awaiting_payment"), done: all.filter((r) => r.status === "dispatched") };
  const list = sets[tab];

  return (
    <>
      <PageHeader eyebrow={<Req ids="F3 · cond. 13" />} title="Document requests" description={`Certificates requested by alumni${group ? "" : ` of ${campusName(me.campusIds[0])}`}. Work starts once Finance has the fee.`} />
      <div className="mb-5">
        <Tabs
          tabs={[
            { id: "todo", label: "To process", count: sets.todo.length },
            { id: "unpaid", label: "Fee not paid", count: sets.unpaid.length },
            { id: "done", label: "Sent", count: sets.done.length },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {list.length === 0 ? (
        <Card>
          <Empty title="Nothing here" />
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {list.map((r) => {
            const u = state.users.find((x) => x.id === r.userId);
            const n = NEXT[r.status];
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-[14px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {r.doc} × {r.copies} <span className="font-normal text-muted">· {u?.name} · Batch {u?.batch}</span>
                  </p>
                  <p className="text-muted">
                    {r.delivery} · {rupees(r.fee)} · {campusName(r.campusId)} · {timeAgo(r.at)}
                  </p>
                </div>
                <Pill tone={docStatus[r.status].tone}>{docStatus[r.status].label}</Pill>
                {n && (
                  <Button size="sm" onClick={() => advanceDocument(r.id, n.to, me.id)}>
                    {n.label}
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
