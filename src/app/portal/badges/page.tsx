"use client";

import Link from "next/link";
import { useState } from "react";
import { Award, Briefcase, GraduationCap, HandCoins, Store, UsersRound } from "lucide-react";
import { Gate } from "@/components/Gate";
import { Button, Callout, Card, Checkbox, Input, Modal, PageHeader, Pill, Req, Select, Textarea } from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/lib/data";
import { activeBadge, useStore } from "@/lib/store";
import type { BadgeType } from "@/lib/types";

const INFO: { type: BadgeType; title: string; icon: typeof Award; how: string; gives: string }[] = [
  { type: "Mentor", title: "Mentor", icon: GraduationCap, how: "Opt in, accept the safeguarding code, Campus Admin approves", gives: "Listed in student mentor search; students can message you" },
  { type: "Recruiter", title: "Recruiter", icon: Briefcase, how: "Request it; Campus Admin approves", gives: "Post jobs (each one checked first); see who's interested in your posts only" },
  { type: "ServiceProvider", title: "Service provider", icon: Store, how: "Submit a listing; Campus Admin approves", gives: "Listed in the Business Directory; alumni can send you enquiries" },
  { type: "ChapterLead", title: "Batch / Chapter Lead", icon: UsersRound, how: "Appointed by the Campus Admin or Group Alumni Office", gives: "Announcements (monthly limit), group events and moderation in your own group" },
  { type: "Donor", title: "Donor", icon: HandCoins, how: "Automatic after your first donation", gives: "Receipts, giving history and an optional place on the donor wall" },
];

export default function BadgesPage() {
  return (
    <Gate roles={["ALU"]}>
      <Badges />
    </Gate>
  );
}

function Badges() {
  const { me, state, applyBadge, setUserFlags } = useStore();
  const [ask, setAsk] = useState<BadgeType | null>(null);
  const [why, setWhy] = useState("");
  const [listing, setListing] = useState({ business: "", category: SERVICE_CATEGORIES[0], city: "", description: "" });
  if (!me) return null;
  const pending = (t: BadgeType) => state.badgeRequests.some((b) => b.userId === me.id && b.badge === t && b.status === "pending");
  const held = (t: BadgeType) => me.badges?.find((b) => b.type === t);
  const svpOk = listing.business.trim().length > 1 && listing.city.trim() && listing.description.trim().length > 10;

  return (
    <>
      <PageHeader eyebrow={<Req ids="§5.2 · C9 · E5 · H9" />} title="My badges" description="Badges add rights on top of your verified alumni account. Every change is approved, logged and can be reversed." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INFO.map((b) => {
          const h = held(b.type);
          return (
            <Card key={b.type} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-[13.5px] text-muted">{b.how}</p>
                </div>
                {h ? <Pill tone={h.status === "active" ? "success" : "danger"}>{h.status === "active" ? "Active" : "Suspended"}</Pill> : pending(b.type) ? <Pill tone="warning">Requested</Pill> : null}
              </div>
              <p className="mt-3 flex-1 text-[14px]">{b.gives}</p>
              {h?.group && <p className="mt-2 text-[13px] text-muted">Group: {h.group.startsWith("batch:") ? `Batch of ${h.group.split(":")[2]}` : "Campus alumni"}</p>}
              <div className="mt-4">
                {b.type === "Mentor" ? (
                  <Button size="sm" variant="secondary" href="/portal/mentor">
                    {h ? "Mentor settings" : "Become a mentor"}
                  </Button>
                ) : b.type === "Donor" ? (
                  <Button size="sm" variant="secondary" href="/portal/give">
                    {h ? "Giving history" : "Give"}
                  </Button>
                ) : b.type === "ChapterLead" ? (
                  h ? (
                    <Button size="sm" variant="secondary" href="/portal/groups">
                      Open my group
                    </Button>
                  ) : (
                    <p className="text-[13px] text-muted">Interested? Tell your campus alumni office.</p>
                  )
                ) : !h && !pending(b.type) ? (
                  <Button size="sm" onClick={() => { setAsk(b.type); setWhy(""); }}>
                    Request badge
                  </Button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5 p-5">
        <Checkbox
          checked={!!me.mczGuide}
          onChange={(v) => setUserFlags(me.id, { mczGuide: v })}
          label="Be a MyCareerZ alumni guide"
          description="MyCareerZ counsellors may see your college, course and country to suggest you as a guide for students. You can switch this off any time."
        />
      </Card>
      {activeBadge(me, "Recruiter") && (
        <Callout tone="info" className="mt-5">
          Post jobs from <Link href="/portal/jobs" className="font-semibold underline">Jobs</Link>. Student applicants&apos; contact details are never shown to you; their counsellor handles it.
        </Callout>
      )}

      <Modal
        open={!!ask}
        onClose={() => setAsk(null)}
        title={ask === "ServiceProvider" ? "Business Directory listing" : "Request Recruiter badge"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAsk(null)}>
              Cancel
            </Button>
            <Button
              disabled={ask === "ServiceProvider" ? !svpOk : why.trim().length < 10}
              onClick={() => {
                if (ask === "ServiceProvider") applyBadge(me.id, "ServiceProvider", listing.description, { ...listing, business: listing.business.trim(), city: listing.city.trim(), description: listing.description.trim() });
                else if (ask) applyBadge(me.id, ask, why.trim());
                setAsk(null);
              }}
            >
              Send to campus for approval
            </Button>
          </>
        }
      >
        {ask === "ServiceProvider" ? (
          <div className="space-y-3">
            <Input placeholder="Business name" value={listing.business} onChange={(e) => setListing({ ...listing, business: e.target.value })} aria-label="Business name" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={listing.category} onChange={(e) => setListing({ ...listing, category: e.target.value })} aria-label="Category">
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Input placeholder="City" value={listing.city} onChange={(e) => setListing({ ...listing, city: e.target.value })} aria-label="City" />
            </div>
            <Textarea rows={3} placeholder="What you offer, and any alumni discount" value={listing.description} onChange={(e) => setListing({ ...listing, description: e.target.value })} aria-label="Description" />
            <p className="text-[13px] text-muted">Phone numbers and links in the description are hidden; enquiries come through VAA.</p>
          </div>
        ) : (
          <>
            <Textarea rows={3} placeholder="Which company do you hire for, and what roles?" value={why} onChange={(e) => setWhy(e.target.value)} aria-label="Why" />
            <p className="mt-2 text-[13px] text-muted">Your campus checks you can post on behalf of the company.</p>
          </>
        )}
      </Modal>
    </>
  );
}
