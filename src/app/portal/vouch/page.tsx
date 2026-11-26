"use client";

import { useState } from "react";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import { Avatar, Button, Callout, Card, Checkbox, Empty, Modal, PageHeader, Pill, Req } from "@/components/ui";
import { campusName } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { VerificationRequest } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function VouchPage() {
  const { me, state, vouch } = useStore();
  const [confirm, setConfirm] = useState<VerificationRequest | null>(null);
  const [sure, setSure] = useState(false);
  if (!me) return null;

  const mine = state.verifications.filter((v) => v.campusId === me.campusIds[0] && v.passYear === me.batch && v.userId !== me.id);
  const open = mine.filter((v) => v.status === "pending");
  const done = mine.filter((v) => v.vouches.some((x) => x.by === me.id));

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="A2 · peer vouch" />}
        title="Vouch for batchmates"
        description={`People who say they were in Batch ${me.batch} at ${campusName(me.campusIds[0])}. Only vouch for someone you genuinely know from school.`}
      />
      <Callout tone="info" className="mb-5">
        Two vouches from verified batchmates verify someone. Your name is recorded with each vouch.
      </Callout>
      {open.filter((v) => !v.vouches.some((x) => x.by === me.id)).length === 0 && done.length === 0 ? (
        <Card>
          <Empty icon={<HeartHandshake className="h-6 w-6" />} title="No requests from your batch">
            When a batchmate signs up and can&apos;t be matched to school records, they&apos;ll appear here.
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...open, ...done.filter((d) => d.status !== "pending")].map((v) => {
            const iVouched = v.vouches.some((x) => x.by === me.id);
            return (
              <Card key={v.id} className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={v.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-[14px] text-muted">
                      Batch {v.passYear} · signed up {timeAgo(v.submittedAt)}
                    </p>
                  </div>
                  {v.status === "peer_approved" ? <Pill tone="success">Verified</Pill> : <Pill tone="warning">Pending</Pill>}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[13.5px]">
                    <span className="font-medium text-muted">Vouches</span>
                    <span className="font-semibold tabular-nums">{v.vouches.length} / 2</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(1, v.vouches.length / 2) * 100}%` }} />
                  </div>
                  <ul className="mt-2 space-y-1">
                    {v.vouches.map((x) => (
                      <li key={x.by} className="text-[13.5px] text-muted">
                        ✓ {x.byName}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  {iVouched ? (
                    <p className="flex items-center gap-1.5 text-[14px] font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" /> You vouched for {v.name.split(" ")[0]}
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setConfirm(v);
                          setSure(false);
                        }}
                      >
                        <HeartHandshake className="h-4 w-4" /> I know them
                      </Button>
                      <Button variant="secondary">I don&apos;t know them</Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Vouch for ${confirm?.name}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!sure}
              onClick={() => {
                if (confirm) vouch(confirm.id, me.id);
                setConfirm(null);
              }}
            >
              Confirm vouch
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[14px] text-muted">
            Verified alumni can message students as mentors, so this matters. Your campus can see who vouched for whom.
          </p>
          {confirm && confirm.vouches.length === 1 && (
            <Callout tone="info">Yours is the second vouch. {confirm.name.split(" ")[0]} will be verified immediately.</Callout>
          )}
          <Checkbox checked={sure} onChange={setSure} label={`I personally know ${confirm?.name} from Batch ${confirm?.passYear} at VIBGYOR`} />
        </div>
      </Modal>
    </>
  );
}
