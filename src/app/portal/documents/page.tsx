"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Button, Card, CardHeader, Empty, Input, PageHeader, Pill, Req, Select } from "@/components/ui";
import { COURIER_FEE, DOC_FEES } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { DocRequest, DocType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { docStatus } from "@/lib/labels";


export default function DocumentsPage() {
  return (
    <Gate roles={["ALU", "ALP"]}>
      <Docs />
    </Gate>
  );
}

function Docs() {
  const { me, state, requestDocument, payDocument } = useStore();
  const [doc, setDoc] = useState<DocType>("Transfer certificate");
  const [copies, setCopies] = useState(1);
  const [delivery, setDelivery] = useState<DocRequest["delivery"]>("Email (scanned)");
  if (!me) return null;
  const fee = DOC_FEES[doc] * copies + (delivery === "Courier" ? COURIER_FEE : 0);
  const mine = state.docRequests.filter((r) => r.userId === me.id);

  return (
    <>
      <PageHeader eyebrow={<Req ids="F3 · cond. 13–14" />} title="School documents" description="Request certificates from your campus. Pay the fee online; the campus office prepares and sends it." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5">
          <div className="space-y-3">
            <Select value={doc} onChange={(e) => setDoc(e.target.value as DocType)} aria-label="Document">
              {(Object.keys(DOC_FEES) as DocType[]).map((d) => (
                <option key={d} value={d}>
                  {d} · ₹{DOC_FEES[d]}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" min={1} max={5} value={copies} onChange={(e) => setCopies(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} aria-label="Copies" />
              <Select value={delivery} onChange={(e) => setDelivery(e.target.value as DocRequest["delivery"])} aria-label="Delivery">
                <option>Email (scanned)</option>
                <option>Collect at campus</option>
                <option>Courier</option>
              </Select>
            </div>
            <p className="text-[14px]">
              Fee: <b>₹{fee.toLocaleString("en-IN")}</b> {delivery === "Courier" && <span className="text-muted">(includes ₹{COURIER_FEE} courier)</span>}
            </p>
            <Button className="w-full" onClick={() => requestDocument(me.id, doc, copies, delivery)}>
              Request
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="My requests" icon={<FileText className="h-5 w-5" />} />
          {mine.length === 0 ? (
            <Empty title="No requests yet" />
          ) : (
            <ul className="divide-y divide-border">
              {mine.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-[14px]">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {r.doc} × {r.copies}
                    </p>
                    <p className="text-muted">
                      {r.delivery} · ₹{r.fee.toLocaleString("en-IN")} · {timeAgo(r.at)}
                      {r.note ? ` · ${r.note}` : ""}
                    </p>
                  </div>
                  <Pill tone={docStatus[r.status].tone}>{docStatus[r.status].label}</Pill>
                  {r.status === "awaiting_payment" && (
                    <Button size="sm" onClick={() => payDocument(r.id, me.id)}>
                      Pay ₹{r.fee.toLocaleString("en-IN")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
