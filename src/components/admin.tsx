"use client";

import { ShieldX } from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { Card, Empty } from "./ui";

export function useScope() {
  const { me } = useStore();
  const group = me?.role === "GAO" || me?.role === "SAD";
  return {
    group,
    inScope: (cid?: string) => !!me && (group || (!!cid && me.campusIds.includes(cid))),
  };
}

export function AdminOnly({ me, children }: { me: User | undefined; children: React.ReactNode }) {
  if (!me || !["CAD", "GAO", "SAD"].includes(me.role))
    return (
      <Card>
        <Empty icon={<ShieldX className="h-6 w-6" />} title="Staff only">
          This page is for Campus Admins, the Group Alumni Office and Super Admins. Use <b>Switch role</b> to sign in as Meera Joshi.
        </Empty>
      </Card>
    );
  return <>{children}</>;
}
