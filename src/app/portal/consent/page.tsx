"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, History } from "lucide-react";
import { Avatar, Button, Callout, Card, CardHeader, Modal, PageHeader, Pill, Req, Switch, Tabs } from "@/components/ui";
import { StatusPill } from "@/components/Homes";
import { campusName, consentPurposes } from "@/lib/data";
import { hasConsent, latestConsent, useStore } from "@/lib/store";
import { MyData } from "@/components/MyData";
import type { ConsentPurpose } from "@/lib/types";
import { firstName, formatDateTime } from "@/lib/utils";

const effects: Record<ConsentPurpose, string> = {
  platform: "The account will be paused straight away. Your child won't be able to sign in, and mentor and MyCareerZ sharing stop too.",
  mentor: "Your child will no longer see mentors, and existing conversations become read-only straight away. Past messages stay on record for safeguarding.",
  mcz: "We stop sharing with MyCareerZ straight away and tell MyCareerZ to stop using the data already shared.",
};

export default function ConsentCentre() {
  const { me, state, setConsent } = useStore();
  const [confirm, setConfirm] = useState<{ studentId: string; purpose: ConsentPurpose; grant: boolean } | null>(null);
  const [childId, setChildId] = useState<string>("");
  // Open on the child named in ?child= (from Parent home or the consent page).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("child");
    if (q) setChildId(q);
  }, []);
  if (!me) return null;

  if (me.role !== "PAR")
    return <Callout tone="warning">The consent centre is for parents and guardians. Switch to Neha Mehta to try it.</Callout>;

  const kids = (me.childIds ?? []).map((id) => state.users.find((u) => u.id === id)!).filter(Boolean);
  // With 2+ children show one child at a time (tabs), so it's always clear whose permissions are being changed.
  const multi = kids.length > 1;
  const active = kids.find((k) => k.id === childId) ?? kids.find((k) => k.studentStatus === "awaiting_consent") ?? kids[0];
  const shown = multi && active ? [active] : kids;
  const confirmChild = confirm ? state.users.find((u) => u.id === confirm.studentId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={
          <div className="flex gap-2">
            <Req ids="A9" /> <Req ids="CS-3" /> <Req ids="CS-11" />
          </div>
        }
        title="Consent centre"
        description="Every permission you've given, when, and under which notice. Change any of them at any time; it takes effect immediately."
      />

      {multi && active && (
        <div className="mb-5">
          <Tabs
            tabs={kids.map((k) => ({ id: k.id, label: firstName(k.name), dot: k.studentStatus === "awaiting_consent" }))}
            value={active.id}
            onChange={setChildId}
          />
        </div>
      )}

      {shown.map((k) => {
        const history = state.audit.filter((a) => a.category === "consent" && a.target.startsWith(k.name)).slice(0, 6);
        const platformOn = hasConsent(state, k.id, "platform");
        return (
          <div key={k.id} className="space-y-5">
            <Card className="p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name={k.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{k.name}</p>
                  <p className="text-sm text-muted">
                    Class {k.className} · {campusName(k.campusIds[0])}
                  </p>
                </div>
                <StatusPill status={k.studentStatus} />
              </div>
            </Card>

            {k.studentStatus === "awaiting_consent" && (
              <Callout tone="warning" title={`${firstName(k.name)}'s account is waiting for you`}>
                <Link href={`/consent/${k.id}?p=${me.id}`} className="font-semibold text-primary underline">
                  Review the consent request
                </Link>{" "}
                to switch it on.
              </Callout>
            )}

            <Card>
              <CardHeader title={multi ? `Permissions for ${firstName(k.name)}` : "Permissions"} subtitle={multi ? `Separate for each purpose. Changes here affect ${firstName(k.name)} only.` : "Separate for each purpose"} />
              <div className="divide-y divide-border">
                {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => {
                  const on = hasConsent(state, k.id, p);
                  const rec = latestConsent(state, k.id, p);
                  const disabled = p !== "platform" && !platformOn;
                  return (
                    <div key={p} className="flex items-start gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{consentPurposes[p].title}</p>
                          {on ? <Pill tone="success">Allowed</Pill> : <Pill>Not allowed</Pill>}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{consentPurposes[p].body}</p>
                        {rec && (
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-muted">
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" /> {rec.status === "granted" ? "Given" : "Withdrawn"} {formatDateTime(rec.withdrawnAt ?? rec.at)}
                            </span>
                            <span>via {rec.channel}</span>
                            <span className="font-mono">{rec.otpRef}</span>
                          </p>
                        )}
                      </div>
                      <Switch
                        label={consentPurposes[p].title}
                        checked={on}
                        disabled={disabled || (k.studentStatus === "awaiting_consent" && !on)}
                        onChange={(v) => setConfirm({ studentId: k.id, purpose: p, grant: v })}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            <MyData subject={k} />
            <div className="grid gap-5">
              <Card>
                <CardHeader title={multi ? `History for ${firstName(k.name)}` : "History"} icon={<History className="h-[18px] w-[18px]" />} />
                {history.length === 0 ? (
                  <p className="px-5 py-5 text-sm text-muted">No consent activity yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {history.map((h) => (
                      <div key={h.id} className="px-5 py-3">
                        <p className="text-sm font-medium">{h.action}</p>
                        <p className="text-label text-muted">
                          {formatDateTime(h.at)} {h.detail && `· ${h.detail}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      })}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.grant ? "Allow" : "Withdraw"} this permission${confirmChild ? ` for ${firstName(confirmChild.name)}` : ""}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm?.grant ? "primary" : "danger"}
              onClick={() => {
                if (!confirm) return;
                if (!confirm.grant && confirm.purpose === "platform") {
                  setConsent(confirm.studentId, "mentor", false, me.id);
                  setConsent(confirm.studentId, "mcz", false, me.id);
                }
                setConsent(confirm.studentId, confirm.purpose, confirm.grant, me.id);
                setConfirm(null);
              }}
            >
              {confirm?.grant ? "Allow" : "Withdraw now"}
            </Button>
          </>
        }
      >
        {confirm && (
          <div className="space-y-3 text-sm leading-relaxed">
            {confirmChild && (
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Avatar name={confirmChild.name} size={36} />
                <div>
                  <p className="font-semibold">{confirmChild.name}</p>
                  <p className="text-label text-muted">
                    Class {confirmChild.className} · {campusName(confirmChild.campusIds[0])}
                  </p>
                </div>
              </div>
            )}
            <p className="font-semibold">{consentPurposes[confirm.purpose].title}</p>
            <p className="text-muted">{confirm.grant ? consentPurposes[confirm.purpose].body : effects[confirm.purpose]}</p>
            <Callout tone="info">Your choice and the time are recorded.</Callout>
          </div>
        )}
      </Modal>
    </>
  );
}
