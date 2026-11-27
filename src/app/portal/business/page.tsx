"use client";

import { useState } from "react";
import { MapPin, Send, Store } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Avatar, Button, Card, Empty, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { campusName, SERVICE_CATEGORIES } from "@/lib/data";
import { activeBadge, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export default function BusinessPage() {
  return (
    <Gate roles={["ALU"]}>
      <Directory />
    </Gate>
  );
}

function Directory() {
  const { me, state, sendEnquiry } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [to, setTo] = useState<User | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  if (!me) return null;
  const n = q.trim().toLowerCase();
  const list = state.users
    .filter((u) => u.role === "ALU" && !u.deactivated && activeBadge(u, "ServiceProvider") && u.listing)
    .filter((u) => cat === "all" || u.listing!.category === cat)
    .filter((u) => !n || `${u.listing!.business} ${u.listing!.description} ${u.listing!.city} ${u.name}`.toLowerCase().includes(n));

  return (
    <>
      <PageHeader eyebrow={<Req ids="C9" />} title="Business directory" description="Services run by verified VIBGYOR alumni. Listings are approved by the campus alumni office." actions={<Button variant="secondary" href="/portal/badges">List my business</Button>} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
        <Input placeholder="Search services, cities, names" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </div>
      {list.length === 0 ? (
        <Card>
          <Empty icon={<Store className="h-6 w-6" />} title="No listings match">Try another category.</Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((u) => (
            <Card key={u.id} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar name={u.listing!.business} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{u.listing!.business}</p>
                  <p className="text-sm text-muted">
                    {u.name} · Batch {u.batch} · {campusName(u.campusIds[0])}
                  </p>
                </div>
                <Pill>{u.listing!.category}</Pill>
              </div>
              <p className="mt-3 flex-1 text-sm">{u.listing!.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {u.listing!.city}
                </span>
                {u.id === me.id ? (
                  <span className="text-label text-muted">Your listing</span>
                ) : sent.includes(u.id) ? (
                  <span className="text-sm font-semibold text-success">Enquiry sent</span>
                ) : (
                  <Button size="sm" onClick={() => { setTo(u); setText(""); }}>
                    <Send className="h-3.5 w-3.5" /> Send enquiry
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={!!to}
        onClose={() => setTo(null)}
        title={`Enquiry to ${to?.listing?.business}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTo(null)}>
              Cancel
            </Button>
            <Button
              disabled={text.trim().length < 5}
              onClick={() => {
                if (to) {
                  sendEnquiry(to.id, me.id, text.trim());
                  setSent([...sent, to.id]);
                }
                setTo(null);
              }}
            >
              Send
            </Button>
          </>
        }
      >
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="What do you need?" aria-label="Message" />
        <p className="mt-2 text-label text-muted">They reply through VAA Chats. Phone numbers and emails you type are hidden.</p>
      </Modal>
    </>
  );
}
