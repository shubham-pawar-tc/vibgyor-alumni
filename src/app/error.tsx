"use client";

import { Button, ErrorState } from "@/components/ui";

/** App-wide error boundary: the same error state used inside screens. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-[var(--card-radius)] border border-border bg-surface">
        <ErrorState title="This page couldn't load" onRetry={reset}>
          Your demo data is safe in this browser. Try again, or go back to the start.
        </ErrorState>
        <div className="border-t border-border px-6 py-4 text-center">
          <Button href="/" variant="ghost" size="sm">
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
