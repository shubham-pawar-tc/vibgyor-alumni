/* Supporting documents for verification (prototype).
   Files are kept in browser storage, so photos are shrunk before saving and PDFs are capped.
   Production would upload to secure server storage instead. */

import type { VerificationDoc } from "./types";
import { uid } from "./utils";

export const DOC_KINDS = ["School ID card", "Leaving certificate", "Mark sheet", "Other"] as const;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_INPUT = 10 * 1024 * 1024; // before shrinking
const MAX_PDF = 1024 * 1024; // 1 MB: kept as-is
const MAX_SIDE = 1600;

export const DOC_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
export const DOC_HINT = "Photo (JPG, PNG) or PDF up to 1 MB";

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function shrinkImage(file: File): Promise<string> {
  const src = await readAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("bad image"));
    i.src = src;
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.fillStyle = "#fff"; // PNG transparency → white page
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/** Checks and prepares a file. Returns a ready-to-store document or a plain-English error. */
export async function prepareDoc(file: File, kind: string): Promise<{ doc?: VerificationDoc; error?: string }> {
  const isPdf = file.type === "application/pdf";
  const isImage = IMAGE_TYPES.includes(file.type);
  if (!isPdf && !isImage) return { error: "Please choose a photo (JPG or PNG) or a PDF." };
  if (isPdf && file.size > MAX_PDF) return { error: "That PDF is over 1 MB. Try a photo of the page instead, or a smaller PDF." };
  if (isImage && file.size > MAX_IMAGE_INPUT) return { error: "That photo is over 10 MB. Please choose a smaller one." };
  try {
    const dataUrl = isPdf ? await readAsDataUrl(file) : await shrinkImage(file);
    const size = Math.round((dataUrl.length * 3) / 4);
    return {
      doc: {
        id: uid("doc"),
        kind,
        name: isPdf ? file.name : file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg",
        type: isPdf ? "application/pdf" : "image/jpeg",
        size,
        dataUrl,
        at: new Date().toISOString(),
      },
    };
  } catch {
    return { error: "We couldn't read that file. Please try another one." };
  }
}

export function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
