"use client";

import { check, clean } from "@/lib/validate";
import { useState } from "react";
import { HandCoins, Heart, Receipt } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Card, CardHeader, Checkbox, FieldError, Input, PageHeader, Pill, Req, Select } from "@/components/ui";
import { campusName, DONATION_FUNDS } from "@/lib/data";
import { activeBadge, useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function GivePage() {
  return (
    <Gate roles={["ALU", "ALP"]} why="Giving is open to alumni. Parents can buy services such as MyCareerZ sessions but can't donate.">
      <Give />
    </Gate>
  );
}

function Give() {
  const { me, state, donate } = useStore();
  const [amount, setAmount] = useState("2500");
  const [fund, setFund] = useState(DONATION_FUNDS[0]);
  const [wall, setWall] = useState(true);
  const [msg, setMsg] = useState("");
  if (!me) return null;
  const mine = state.payments.filter((p) => p.kind === "donation" && p.payerId === me.id);
  const amtErr = check.number(amount, { min: 100, max: 1000000, label: "Amount" });
  const wallers = state.users.filter((u) => u.donorWall && activeBadge(u, "Donor") && !u.deactivated);

  return (
    <>
      <PageHeader eyebrow={<Req ids="H1 · H9 · cond. 15–16" />} title="Give" description="Support VIBGYOR students. Every gift gets an 80G receipt, and your first gift adds the Donor badge." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap gap-2">
              {[1000, 2500, 5000, 10000].map((a) => (
                <button key={a} type="button" onClick={() => setAmount(String(a))} className={`rounded-full border px-4 py-1.5 text-[14px] font-semibold ${amount === String(a) ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-2"}`}>
                  ₹{a.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Input inputMode="numeric" value={amount} invalid={!!amtErr} onChange={(e) => setAmount(clean.digits(e.target.value, 7))} aria-label="Amount in rupees" placeholder="Amount (₹)" />
                <FieldError error={amtErr} />
              </div>
              <Select value={fund} onChange={(e) => setFund(e.target.value)} aria-label="Fund">
                {DONATION_FUNDS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </div>
            <div className="mt-4">
              <Checkbox checked={wall} onChange={setWall} label="Show my name on the donor wall" description="Name and batch only, never the amount." />
            </div>
            <Button
              size="lg"
              className="mt-5 w-full"
              disabled={!!amtErr}
              onClick={() => {
                const r = donate(me.id, Number(amount), fund, wall);
                setMsg(r.ok ? `Thank you! ₹${Number(amount).toLocaleString("en-IN")} received. Receipt sent to your email.` : (r.error ?? ""));
              }}
            >
              <HandCoins className="h-4 w-4" /> Pay ₹{Number(amount || 0).toLocaleString("en-IN")} (demo payment)
            </Button>
            {msg && <p className="mt-3 text-[14px] font-semibold text-success">{msg}</p>}
          </Card>
          <Card>
            <CardHeader title="Giving history" icon={<Receipt className="h-5 w-5" />} />
            {mine.length === 0 ? (
              <p className="p-5 text-[14px] text-muted">No gifts yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {mine.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                    <span>
                      <b>₹{p.amount.toLocaleString("en-IN")}</b> · {p.fund} <span className="text-muted">· {formatDate(p.at)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {p.status === "refunded" ? <Pill tone="neutral">Refunded</Pill> : <Pill tone="success">80G receipt</Pill>}
                      <span className="font-mono text-[12.5px] text-muted">{p.ref}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader title="Donor wall" subtitle="Alumni who chose to be listed" icon={<Heart className="h-5 w-5" />} />
          <ul className="space-y-2 p-5">
            {wallers.map((u) => (
              <li key={u.id} className="flex items-center gap-2.5 text-[14px]">
                <Avatar name={u.name} size={28} />
                <span>
                  {u.name} <span className="text-muted">· Batch {u.batch} · {campusName(u.campusIds[0])}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
