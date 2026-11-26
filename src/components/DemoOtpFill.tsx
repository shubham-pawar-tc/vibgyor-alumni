"use client";

import { KeyRound } from "lucide-react";
import { useStore } from "@/lib/store";

/** Demo-only helper: fills the latest OTP sent for this key (also visible in the device simulator). */
export function DemoOtpFill({ otpKey, onFill }: { otpKey: string; onFill: (code: string) => void }) {
  const { peekOtp } = useStore();
  return (
    <button
      type="button"
      onClick={() => {
        const c = peekOtp(otpKey);
        if (c) onFill(c);
      }}
      className="mx-auto flex items-center gap-1.5 text-[14px] font-semibold text-primary"
    >
      <KeyRound className="h-3.5 w-3.5" /> Autofill demo code
    </button>
  );
}
