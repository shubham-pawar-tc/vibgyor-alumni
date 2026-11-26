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

export function AdminOnly({ me, children, alsoAllow = [] }: { me: User | undefined; children: React.ReactNode; alsoAllow?: User["role"][] }) {
  if (!me || !["CAD", "GAO", "SAD", ...alsoAllow].includes(me.role))
    return (
      <Card>
        <Empty icon={<ShieldX className="h-6 w-6" />} title="Staff only">
          This page is for Campus Admins, the Group Alumni Office and Super Admins. Use <b>Switch role</b> to sign in as Meera Joshi.
        </Empty>
      </Card>
    );
  return <>{children}</>;
}

/** Hides an action when the permissions matrix (A6) doesn't grant it, and says why. */
export function NoPermission({ what }: { what: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-2.5 py-1.5 text-[13px] font-medium text-muted" title="Change this in Permissions (Super Admin)">
      <ShieldX className="h-3.5 w-3.5" /> Your role can&apos;t {what}
    </span>
  );
}
