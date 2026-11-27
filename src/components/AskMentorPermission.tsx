"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { Button } from "./ui";

/** Student asks their parent(s) to switch on "Mentor contact". Only shown to active students with it off. */
export function AskMentorPermission({ me }: { me: User }) {
  const { state, requestMentorPermission } = useStore();
  const sent = state.outbox.some((o) => o.link?.href === `/portal/consent?child=${me.id}` && o.body.includes("would like to talk to approved alumni mentors"));
  if (me.studentStatus !== "active") return null;
  return sent ? (
    <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-success">
      <CheckCircle2 className="h-4 w-4" /> Request sent to your parent
    </p>
  ) : (
    <Button size="sm" className="mt-3" onClick={() => requestMentorPermission(me.id)}>
      <Send className="h-4 w-4" /> Ask my parent to allow mentor contact
    </Button>
  );
}
