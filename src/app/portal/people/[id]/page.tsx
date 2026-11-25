"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Gate } from "@/components/Gate";
import { ProfileCard } from "@/components/ProfileCard";
import { Button, Callout, Card, Empty } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function PersonPage() {
  return (
    <Gate roles={["ALU", "CAD", "GAO", "SAD"]}>
      <Person />
    </Gate>
  );
}

function Person() {
  const { id } = useParams<{ id: string }>();
  const { me, state, openDm, log } = useStore();
  const router = useRouter();
  const owner = state.users.find((u) => u.id === id && (u.role === "ALU" || u.role === "ALP"));
  const logged = useRef(false);
  const staff = !!me && ["CAD", "GAO", "SAD"].includes(me.role);

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
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
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
            <Button
              onClick={() => {
                const t = openDm(me.id, owner.id);
                router.push(`/portal/chats?t=${t}`);
              }}
            >
              <MessageCircle className="h-4 w-4" /> Message
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
