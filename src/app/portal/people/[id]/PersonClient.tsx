"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRouteParam } from "@/lib/useRouteParam";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Gate } from "@/components/Gate";
import { ProfileCard } from "@/components/ProfileCard";
import Link from "next/link";
import { ReportButton } from "@/components/ReportButton";
import { Button, Callout, Card, Empty, Pill } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { useStore } from "@/lib/store";

export default function PersonPage() {
  return (
    <Gate roles={["ALU", "CAD", "GAO", "SAD"]}>
      <Person />
    </Gate>
  );
}

function Person() {
  const id = useRouteParam("id", 2);
  const { me, state, openDm, log } = useStore();
  const router = useRouter();
  const staff = !!me && ["CAD", "GAO", "SAD"].includes(me.role);
  const owner = state.users.find((u) => u.id === id && (u.role === "ALU" || u.role === "ALP") && (staff || !u.deactivated));
  const logged = useRef(false);

  useEffect(() => {
    // staff opening a full record is written to the audit log (A12)
    if (staff && owner && me && !logged.current) {
      logged.current = true;
      log({ actorId: me.id, action: "Viewed alumni profile", target: owner.name, campusId: owner.campusIds[0], category: "data_access" });
    }
  }, [staff, owner, me, log]);

  if (!me) return null;
  if (!owner)
    return (
      <Card>
        <Empty title="Profile not found" />
      </Card>
    );

  return (
    <>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm font-medium text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {staff && (
        <Callout tone="warning" className="mb-4">
          You&apos;re seeing the full record as campus staff. This view has been written to the audit log.
        </Callout>
      )}
      <ProfileCard
        owner={owner}
        viewer={me}
        actions={
          me.role === "ALU" && owner.id !== me.id ? (
            <>
              <Button
                onClick={() => {
                  const t = openDm(me.id, owner.id);
                  router.push(`/portal/chats?t=${t}`);
                }}
              >
                <MessageCircle className="h-4 w-4" /> Message
              </Button>
              <ReportButton kind="profile" targetId={owner.id} />
            </>
          ) : undefined
        }
      />
      {staff && <StaffPanel ownerId={owner.id} />}
    </>
  );
}

function StaffPanel({ ownerId }: { ownerId: string }) {
  const { state } = useStore();
  const owner = state.users.find((u) => u.id === ownerId)!;
  const items = state.engagements.filter((e) => e.alumniId === ownerId).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="text-sm font-semibold">Engagement history (staff only)</p>
        <Link href="/portal/admin/engagement" className="text-sm font-semibold text-primary">
          Log interaction
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">No interactions logged with {owner.name.split(" ")[0]} yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm">
              <Pill tone="primary">{e.mode}</Pill>
              <Pill>{e.category}</Pill>
              <span className="min-w-0 flex-1">{e.note}</span>
              <span className="text-label text-muted">{formatDate(e.at)}</span>
            </div>
          ))}
        </div>
      )}
      {owner.mergedFrom?.length ? <p className="border-t border-border px-5 py-3 text-label text-muted">Merged from record {owner.mergedFrom.join(", ")} (L4)</p> : null}
    </Card>
  );
}
