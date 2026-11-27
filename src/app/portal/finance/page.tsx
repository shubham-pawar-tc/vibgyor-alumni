"use client";

import { useState } from "react";
import { Download, IndianRupee, RotateCcw } from "lucide-react";
import { Gate } from "@/components/Gate";
import { NoPermission, useScope } from "@/components/admin";
import { Button, Card, Input, Modal, PageHeader, Pill, Req, Select, Stat, Tabs, Textarea } from "@/components/ui";
import { campusName } from "@/lib/data";
import { download, toCsv } from "@/lib/admin";
import { rupees } from "@/lib/labels";
import { can, useStore } from "@/lib/store";
import type { Payment, PaymentKind } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const KIND: Record<PaymentKind, string> = { donation: "Donation", doc_fee: "Document fee", mcz_session: "MyCareerZ session" };

export default function FinancePage() {
  return (
    <Gate roles={["FIN", "SAD", "GAO"]} why="Finance & Commerce and the Super Admin manage payments.">
      <Finance />
    </Gate>
  );
}

function Finance() {
  const { me, state, refundPayment, reconcilePayments, logExport } = useStore();
  const { inScope } = useScope();
  const [tab, setTab] = useState<"all" | "recon" | "refunds">("all");
  const [kind, setKind] = useState<"all" | PaymentKind>("all");
  const [refund, setRefund] = useState<Payment | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [exp, setExp] = useState(false);
  const [expReason, setExpReason] = useState("");
  if (!me) return null;
  if (!can(state, me, "finance.view"))
    return (
      <Card className="p-6">
        <NoPermission what="see payments" />
      </Card>
    );
  const canRefund = can(state, me, "finance.refund");

  const mine = state.payments.filter((p) => inScope(p.campusId)).filter((p) => kind === "all" || p.kind === kind);
  const paid = mine.filter((p) => p.status === "paid");
  const list = tab === "recon" ? paid.filter((p) => !p.reconciled) : tab === "refunds" ? mine.filter((p) => p.status === "refunded") : mine;
  const sum = (xs: Payment[]) => xs.reduce((a, p) => a + p.amount, 0);
  const name = (id: string) => state.users.find((u) => u.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="H · cond. 14 · 25" />}
        title="Finance"
        description={me.role === "FIN" ? `Payments for your ${me.campusIds.length} campuses: ${me.campusIds.map((c) => campusName(c)).join(", ")}` : "Payments across all campuses"}
        actions={
          <Button variant="secondary" onClick={() => { setExp(true); setExpReason(""); }}>
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Collected" value={rupees(sum(paid))} icon={<IndianRupee className="h-5 w-5" />} />
        <Stat label="Donations" value={rupees(sum(paid.filter((p) => p.kind === "donation")))} tone="success" />
        <Stat label="To reconcile" value={paid.filter((p) => !p.reconciled).length} tone="warning" />
        <Stat label="Refunded" value={rupees(sum(mine.filter((p) => p.status === "refunded")))} tone="danger" />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: "all", label: "All payments", count: mine.length },
            { id: "recon", label: "To reconcile", count: paid.filter((p) => !p.reconciled).length },
            { id: "refunds", label: "Refunds", count: mine.filter((p) => p.status === "refunded").length },
          ]}
          value={tab}
          onChange={(t) => { setTab(t); setSel([]); }}
        />
        <Select className="w-52" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Type">
          <option value="all">All types</option>
          {(Object.keys(KIND) as PaymentKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND[k]}
            </option>
          ))}
        </Select>
      </div>
      {tab === "recon" && (
        <div className="mb-3 flex items-center gap-3">
          {canRefund ? (
            <Button size="sm" disabled={!sel.length} onClick={() => { reconcilePayments(sel, me.id); setSel([]); }}>
              Mark {sel.length || ""} matched with bank statement
            </Button>
          ) : (
            <NoPermission what="reconcile payments" />
          )}
        </div>
      )}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-label uppercase tracking-[0.08em] text-muted">
            <tr>
              {tab === "recon" && <th className="w-10 px-4 py-3" />}
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Paid by</th>
              <th className="px-4 py-3 font-semibold">Campus</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((p) => (
              <tr key={p.id}>
                {tab === "recon" && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={sel.includes(p.id)} onChange={(e) => setSel(e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id))} aria-label={`Select ${p.ref}`} />
                  </td>
                )}
                <td className="px-4 py-3">
                  <p className="font-semibold">{KIND[p.kind]}{p.fund ? ` · ${p.fund}` : ""}</p>
                  <p className="font-mono text-label text-muted">
                    {p.ref} · {formatDate(p.at)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {name(p.payerId)}
                  {p.forUserId && <span className="text-muted"> for {name(p.forUserId)}</span>}
                </td>
                <td className="px-4 py-3">{campusName(p.campusId)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{rupees(p.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.status === "refunded" ? <Pill tone="danger">Refunded</Pill> : <Pill tone="success">Paid</Pill>}
                    {p.reconciled && <Pill tone="neutral">Reconciled</Pill>}
                  </div>
                  {p.refund && <p className="mt-1 text-label text-muted">{p.refund.reason}</p>}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "paid" && canRefund && (
                    <Button size="sm" variant="ghost" onClick={() => { setRefund(p); setReason(""); setErr(""); }}>
                      <RotateCcw className="h-4 w-4" /> Refund
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!refund}
        onClose={() => setRefund(null)}
        title={refund ? `Refund ${rupees(refund.amount)} · ${refund.ref}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefund(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!refund) return;
                const r = refundPayment(refund.id, reason, me.id);
                if (r.ok) setRefund(null);
                else setErr(r.error ?? "");
              }}
            >
              Refund
            </Button>
          </>
        }
      >
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (shown to the payer and in the audit log)" aria-label="Reason" />
        <p className="mt-2 text-label text-muted">A refunded document fee puts the request back to &quot;Fee due&quot;; a refunded MyCareerZ session is cancelled.</p>
        {err && <p className="mt-2 text-sm font-semibold text-danger">{err}</p>}
      </Modal>

      <Modal
        open={exp}
        onClose={() => setExp(false)}
        title="Export payments"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExp(false)}>
              Cancel
            </Button>
            <Button
              disabled={expReason.trim().length < 5}
              onClick={() => {
                download("payments.csv", toCsv([["Ref", "Type", "Fund", "Paid by", "Campus", "Amount", "Status", "Reconciled", "Date"], ...list.map((p) => [p.ref, KIND[p.kind], p.fund, name(p.payerId), campusName(p.campusId), p.amount, p.status, p.reconciled ? "yes" : "no", p.at])]));
                logExport(me.id, `${list.length} payments`, expReason.trim(), me.campusIds.length === 1 ? me.campusIds[0] : undefined);
                setExp(false);
              }}
            >
              Download CSV
            </Button>
          </>
        }
      >
        <Input value={expReason} onChange={(e) => setExpReason(e.target.value)} placeholder="Why do you need this export? (recorded)" aria-label="Reason" />
      </Modal>
    </>
  );
}
