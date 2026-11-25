"use client";

import { Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Card, Empty } from "./ui";

/** Shows children only to the listed roles; explains why otherwise. */
export function Gate({ roles, children, why }: { roles: Role[]; children: React.ReactNode; why?: string }) {
  const { me } = useStore();
  if (!me) return null;
  if (roles.includes(me.role)) return <>{children}</>;
  const msg =
    why ??
    (me.role === "ALP"
      ? "This opens as soon as your campus verifies you. You can complete your profile meanwhile."
      : me.role === "STU" || me.role === "PAR"
        ? "For child safety, students and parents can't browse alumni. Students talk only to approved mentors."
        : "Your role doesn't include this page.");
  return (
    <Card>
      <Empty icon={<Lock className="h-6 w-6" />} title="Not available for your account">
        {msg}
      </Empty>
    </Card>
  );
}
