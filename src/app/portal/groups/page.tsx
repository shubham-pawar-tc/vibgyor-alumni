"use client";

import { allOk, check, clean, whenFilled } from "@/lib/validate";
import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, Heart, Megaphone, Send, Trash2, Users, UsersRound } from "lucide-react";
import { Gate } from "@/components/Gate";
import { ReportButton } from "@/components/ReportButton";
import { Avatar, Button, Card, Checkbox, Empty, FieldError, Input, Modal, PageHeader, Pill, Req, Textarea } from "@/components/ui";
import { roleLabels } from "@/lib/data";
import { groupMembers, groupsFor } from "@/lib/community";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

const future = (v: string) => (v && new Date(v).getTime() < Date.now() ? "Pick a time in the future" : "");

export default function GroupsPage() {
  return (
    <Gate roles={["ALU"]}>
      <Groups />
    </Gate>
  );
}

function Groups() {
  const { me, state, addPost, toggleLike, announce, removePost, createEvent } = useStore();
  const [asAnn, setAsAnn] = useState(false);
  const [err, setErr] = useState("");
  const [ev, setEv] = useState<{ title: string; start: string; venue: string } | null>(null);
  const groups = me ? groupsFor(me) : [];
  const [gid, setGid] = useState(groups[0]?.id ?? "");
  const [text, setText] = useState("");
  if (!me) return null;
  const g = groups.find((x) => x.id === gid) ?? groups[0];
  const members = groupMembers(state, g);
  const posts = state.posts.filter((p) => p.groupId === g.id).sort((a, b) => Number(!!b.announcement) - Number(!!a.announcement) || Date.parse(b.at) - Date.parse(a.at));
  const cl = me.badges?.find((b) => b.type === "ChapterLead" && b.status === "active" && b.group === g.id);
  const month = new Date().toISOString().slice(0, 7);
  const used = state.posts.filter((p) => p.groupId === g.id && p.announcement && p.at.slice(0, 7) === month).length;

  return (
    <>
      <PageHeader eyebrow={<Req ids="C4" />} title="Batch groups" description="You're added automatically to your batch and your campus. Only verified alumni can see these posts." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_260px]">
        <div className="space-y-2">
          {groups.map((x) => (
            <button
              key={x.id}
              onClick={() => setGid(x.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left", x.id === g.id ? "border-primary bg-primary-soft/50" : "border-border bg-surface hover:bg-surface-2")}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-muted">{x.kind === "batch" ? <UsersRound className="h-4 w-4" /> : <Users className="h-4 w-4" />}</span>
              <span className="min-w-0">
                <span className="block truncate text-body font-semibold">{x.name}</span>
                <span className="text-label text-muted">{groupMembers(state, x).length} members here</span>
              </span>
            </button>
          ))}
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                setErr("");
                if (asAnn && cl) {
                  const r = announce(g.id, me.id, text.trim());
                  if (!r.ok) return setErr(r.error ?? "");
                  setAsAnn(false);
                } else addPost(g.id, me.id, text.trim());
                setText("");
              }}
            >
              <div className="flex gap-3">
                <Avatar name={me.name} size={38} />
                <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Share something with ${g.name}`} />
              </div>
              {cl && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-soft/40 px-3 py-2">
                  <Checkbox checked={asAnn} onChange={setAsAnn} label={`Post as announcement (${used} of ${state.chapterMonthlyLimit} this month)`} />
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEv({ title: "", start: "", venue: "" })}>
                    <CalendarPlus className="h-3.5 w-3.5" /> Group event
                  </Button>
                </div>
              )}
              {err && <p className="mt-2 text-sm font-semibold text-danger">{err}</p>}
              <div className="mt-2 flex justify-end">
                <Button type="submit" size="sm" disabled={!text.trim()}>
                  <Send className="h-3.5 w-3.5" /> Post
                </Button>
              </div>
            </form>
          </Card>
          {posts.length === 0 ? (
            <Card>
              <Empty title="No posts yet">Start the conversation.</Empty>
            </Card>
          ) : (
            posts.map((p) => {
              const a = state.users.find((u) => u.id === p.authorId);
              const liked = p.likes.includes(me.id);
              const staff = a && ["CAD", "GAO", "SAD"].includes(a.role);
              return (
                <Card key={p.id} className={cn("p-4", p.announcement && "border-primary")}>
                  <div className="flex items-center gap-3">
                    <Avatar name={a?.name ?? "?"} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-body font-semibold">
                        {a && !staff ? <Link href={`/portal/people/${a.id}`} className="hover:underline">{a.name}</Link> : a?.name}
                        {staff && <Pill tone="primary">{roleLabels[a!.role]}</Pill>}
                        {p.announcement && (
                          <Pill tone="primary" icon={<Megaphone className="h-3 w-3" />}>
                            Announcement
                          </Pill>
                        )}
                      </p>
                      <p className="text-label text-muted">{timeAgo(p.at)}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{p.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <button onClick={() => toggleLike(p.id, me.id)} className={cn("flex items-center gap-2 text-sm font-medium", liked ? "text-danger" : "text-muted hover:text-text")}>
                      <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {p.likes.length || ""} {p.likes.length === 1 ? "like" : "likes"}
                    </button>
                    <span className="flex items-center gap-2">
                      {cl && p.authorId !== me.id && !staff && (
                        <button onClick={() => removePost(p.id, me.id)} className="flex items-center gap-1 text-label font-medium text-muted hover:text-danger" title="Remove (Chapter Lead)">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                      {p.authorId !== me.id && !staff && <ReportButton kind="post" targetId={p.id} compact />}
                    </span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card className="h-fit p-4">
          <p className="mb-3 text-sm font-semibold">Members</p>
          <div className="space-y-2">
            {members.slice(0, 10).map((u) => (
              <Link key={u.id} href={`/portal/people/${u.id}`} className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-surface-2">
                <Avatar name={u.name} size={28} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{u.id === me.id ? `${u.name} (you)` : u.name}</span>
                  <span className="block truncate text-label text-muted">Batch {u.batch}</span>
                </span>
              </Link>
            ))}
          </div>
          {members.length > 10 && <p className="mt-2 text-label text-muted">+{members.length - 10} more</p>}
        </Card>
      </div>
      <Modal
        open={!!ev}
        onClose={() => setEv(null)}
        title={`New event for ${g.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEv(null)}>
              Cancel
            </Button>
            <Button
              disabled={!ev || !allOk(check.text(ev.title, "t", { min: 3, max: 100 }), check.text(ev.venue, "v", { min: 3, max: 120 })) || !ev.start || new Date(ev.start).getTime() < Date.now()}
              onClick={() => {
                if (!ev) return;
                const start = new Date(ev.start);
                createEvent({
                  title: ev.title.trim(),
                  kind: "Meetup",
                  description: `Organised by ${me.name}, Chapter Lead for ${g.name}.`,
                  campusIds: [g.campusId],
                  audience: ["ALU"],
                  start: start.toISOString(),
                  end: new Date(start.getTime() + 3 * 3600_000).toISOString(),
                  venue: ev.venue.trim(),
                  online: false,
                  capacity: 80,
                  createdBy: me.id,
                  groupId: g.id,
                });
                setEv(null);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        {ev && (
          <div className="space-y-3">
            <Input placeholder="Title" value={ev.title} invalid={!!whenFilled(ev.title, check.text(ev.title, "Title", { min: 3, max: 100 }))} onChange={(e) => setEv({ ...ev, title: clean.text(e.target.value, 100) })} aria-label="Title" />
            <FieldError error={whenFilled(ev.title, check.text(ev.title, "Title", { min: 3, max: 100 }))} />
            <Input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={ev.start} invalid={!!future(ev.start)} onChange={(e) => setEv({ ...ev, start: e.target.value })} aria-label="Start" />
            <FieldError error={future(ev.start)} />
            <Input placeholder="Venue" value={ev.venue} invalid={!!whenFilled(ev.venue, check.text(ev.venue, "Venue", { min: 3, max: 120 }))} onChange={(e) => setEv({ ...ev, venue: clean.text(e.target.value, 120) })} aria-label="Venue" />
            <FieldError error={whenFilled(ev.venue, check.text(ev.venue, "Venue", { min: 3, max: 120 }))} />
            <p className="text-label text-muted">Shown in Events to verified alumni of this group.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
