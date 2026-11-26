"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Send, Users, UsersRound } from "lucide-react";
import { Gate } from "@/components/Gate";
import { ReportButton } from "@/components/ReportButton";
import { Avatar, Button, Card, Empty, PageHeader, Pill, Req, Textarea } from "@/components/ui";
import { roleLabels } from "@/lib/data";
import { groupMembers, groupsFor } from "@/lib/community";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

export default function GroupsPage() {
  return (
    <Gate roles={["ALU"]}>
      <Groups />
    </Gate>
  );
}

function Groups() {
  const { me, state, addPost, toggleLike } = useStore();
  const groups = me ? groupsFor(me) : [];
  const [gid, setGid] = useState(groups[0]?.id ?? "");
  const [text, setText] = useState("");
  if (!me) return null;
  const g = groups.find((x) => x.id === gid) ?? groups[0];
  const members = groupMembers(state, g);
  const posts = state.posts.filter((p) => p.groupId === g.id).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

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
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{x.kind === "batch" ? <UsersRound className="h-4 w-4" /> : <Users className="h-4 w-4" />}</span>
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold">{x.name}</span>
                <span className="text-[13px] text-muted">{groupMembers(state, x).length} members here</span>
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
                addPost(g.id, me.id, text.trim());
                setText("");
              }}
            >
              <div className="flex gap-3">
                <Avatar name={me.name} size={38} />
                <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Share something with ${g.name}`} />
              </div>
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
                <Card key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={a?.name ?? "?"} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[14.5px] font-semibold">
                        {a && !staff ? <Link href={`/portal/people/${a.id}`} className="hover:underline">{a.name}</Link> : a?.name}
                        {staff && <Pill tone="primary">{roleLabels[a!.role]}</Pill>}
                      </p>
                      <p className="text-[13px] text-muted">{timeAgo(p.at)}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">{p.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <button onClick={() => toggleLike(p.id, me.id)} className={cn("flex items-center gap-1.5 text-[13.5px] font-medium", liked ? "text-danger" : "text-muted hover:text-text")}>
                      <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {p.likes.length || ""} {p.likes.length === 1 ? "like" : "likes"}
                    </button>
                    {p.authorId !== me.id && !staff && <ReportButton kind="post" targetId={p.id} compact />}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card className="h-fit p-4">
          <p className="mb-3 text-[14px] font-semibold">Members</p>
          <div className="space-y-2">
            {members.slice(0, 10).map((u) => (
              <Link key={u.id} href={`/portal/people/${u.id}`} className="flex items-center gap-2.5 rounded-xl px-1 py-1 hover:bg-surface-2">
                <Avatar name={u.name} size={28} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium">{u.id === me.id ? `${u.name} (you)` : u.name}</span>
                  <span className="block truncate text-[12.5px] text-muted">Batch {u.batch}</span>
                </span>
              </Link>
            ))}
          </div>
          {members.length > 10 && <p className="mt-2 text-[13px] text-muted">+{members.length - 10} more</p>}
        </Card>
      </div>
    </>
  );
}
