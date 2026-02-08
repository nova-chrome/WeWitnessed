"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";

interface CopyButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "onClick"
> {
  value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    copyToClipboard(value);
    setCopied(true);
  }

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className={cn("shrink-0 text-muted-foreground", className)}
      {...props}
    >
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
}
