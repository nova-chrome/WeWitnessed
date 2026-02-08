"use client";

import { useState } from "react";

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Test error to preview global-error page");
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <button
        onClick={() => setShouldThrow(true)}
        className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
      >
        Trigger error
      </button>
    </div>
  );
}
