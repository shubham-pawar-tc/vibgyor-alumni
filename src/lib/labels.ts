import type { Booking, DocRequest } from "./types";

type T = "warning" | "info" | "success" | "neutral" | "primary" | "danger";

export const docStatus: Record<DocRequest["status"], { label: string; tone: T }> = {
  awaiting_payment: { label: "Fee due", tone: "warning" },
  paid: { label: "Paid · waiting for campus", tone: "info" },
  processing: { label: "Being prepared", tone: "primary" },
  ready: { label: "Ready", tone: "success" },
  dispatched: { label: "Sent", tone: "neutral" },
};

export const bookingStatus: Record<Booking["status"], { label: string; tone: T }> = {
  referred: { label: "Referred by teacher", tone: "warning" },
  requested: { label: "Requested", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  done: { label: "Done", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
