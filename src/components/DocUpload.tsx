"use client";
/* eslint-disable @next/next/no-img-element -- previews of local data URLs */

import { useRef, useState } from "react";
import { FileText, Paperclip, Send, Trash2, Upload } from "lucide-react";
import { Button, Callout, Select } from "./ui";
import { DOC_ACCEPT, DOC_HINT, DOC_KINDS, fileSize, prepareDoc } from "@/lib/files";
import type { VerificationDoc } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

/** Reply to a campus info request with a message and, optionally, one supporting document. */
export function DocUpload({ onSend, previous }: { onSend: (reply: string, doc?: VerificationDoc) => void; previous: VerificationDoc[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [reply, setReply] = useState("");
  const [kind, setKind] = useState<string>(DOC_KINDS[1]);
  const [doc, setDoc] = useState<VerificationDoc | undefined>();
  const [err, setErr] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setErr(undefined);
    setBusy(true);
    const r = await prepareDoc(file, kind);
    setBusy(false);
    if (r.error) setErr(r.error);
    else setDoc(r.doc);
    if (input.current) input.current.value = "";
  };

  const send = () => {
    onSend(reply, doc ? { ...doc, kind } : undefined);
    setReply("");
    setDoc(undefined);
  };

  return (
    <div className="mt-5 space-y-5">
      <div>
        <label htmlFor="info-reply" className="block font-semibold">
          Your reply
        </label>
        <textarea
          id="info-reply"
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="e.g. My admission number was VG-MAL-2006-0112. My leaving certificate is attached."
          className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-body outline-none focus:border-primary"
        />
      </div>

      <div>
        <p className="font-semibold">Attach a document</p>
        <p className="text-sm text-muted">A school ID, leaving certificate or mark sheet helps the office verify you faster.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
          <div>
            <label htmlFor="doc-kind" className="text-label text-muted">
              What is it?
            </label>
            <Select id="doc-kind" value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1">
              {DOC_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </Select>
          </div>

          {!doc ? (
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${
                drag ? "border-primary bg-primary-soft" : "border-border-strong hover:border-primary hover:bg-surface-2/50"
              }`}
            >
              <Upload className="h-5 w-5 text-muted" />
              <span className="text-sm font-semibold">{busy ? "Preparing…" : "Choose a file or drop it here"}</span>
              <span className="text-label text-muted">{DOC_HINT}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-3">
              {doc.type === "image/jpeg" ? (
                <img src={doc.dataUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-border bg-surface">
                  <FileText className="h-7 w-7 text-danger" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.name}</p>
                <p className="text-label text-muted">
                  {kind} · {fileSize(doc.size)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDoc(undefined)} aria-label="Remove file">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <input ref={input} type="file" accept={DOC_ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        {err && (
          <Callout tone="danger" className="mt-3">
            {err}
          </Callout>
        )}
      </div>

      {previous.length > 0 && (
        <div>
          <p className="text-label font-semibold text-muted">Already sent</p>
          <ul className="mt-1 space-y-1">
            {previous.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 text-muted" /> {d.kind} · {d.name} <span className="text-muted">· {timeAgo(d.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Button disabled={busy || (!reply.trim() && !doc)} onClick={send}>
          <Send className="h-4 w-4" /> Send to the alumni office
        </Button>
        <p className="mt-2 text-label text-muted">
          Only your campus alumni office can see the document. Your request goes back into their review queue; vouching pauses until then.
        </p>
      </div>
    </div>
  );
}
