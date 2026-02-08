"use client";

import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  KeyRoundIcon,
  Share2Icon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

interface EventShareDialogProps {
  slug: string;
  coupleSecret: string;
  className?: string;
}

export function EventShareDialog({
  slug,
  coupleSecret,
  className,
}: EventShareDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copiedGuest, setCopiedGuest] = useState(false);
  const [copiedCouple, setCopiedCouple] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const guestLink = `${origin}/e/${slug}`;
  const coupleLink = `${guestLink}?s=${coupleSecret}`;

  function handleCopyGuest() {
    navigator.clipboard.writeText(guestLink);
    setCopiedGuest(true);
    setTimeout(() => setCopiedGuest(false), 2000);
  }

  function handleCopyCouple() {
    navigator.clipboard.writeText(coupleLink);
    setCopiedCouple(true);
    setTimeout(() => setCopiedCouple(false), 2000);
  }

  function handleDownloadQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const scale = 3; // 3x for high-res print output
    canvas.width = 180 * scale;
    canvas.height = 180 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const a = document.createElement("a");
      a.download = `${slug}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center size-8 rounded-full",
            "text-muted-foreground hover:text-foreground transition-colors",
            className,
          )}
          aria-label="Share event"
        >
          <Share2Icon className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader className="items-center">
          <DialogTitle className="text-base font-light tracking-wide">
            Share Event
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80">
            Guests scan the QR code or use the link below
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div ref={qrRef} className="bg-white rounded-sm p-5 shadow-2xl shadow-white/5">
            <QRCodeSVG
              value={guestLink}
              size={180}
              level="M"
              bgColor="#ffffff"
              fgColor="#0a0a0a"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadQR}
            className="text-muted-foreground text-xs"
          >
            <DownloadIcon className="size-3.5 mr-1.5" />
            Save QR code
          </Button>
        </div>

        {/* Guest link */}
        <div>
          <Label className="text-muted-foreground text-xs tracking-wider uppercase mb-2 block">
            Guest link
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={guestLink}
              className="bg-card border-border text-foreground text-sm font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyGuest}
              className="shrink-0 text-muted-foreground"
            >
              {copiedGuest ? (
                <CheckIcon className="size-4 text-emerald-400" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Couple link */}
        <div>
          <Label className="text-muted-foreground text-xs tracking-wider uppercase mb-2 block">
            <KeyRoundIcon className="size-3 inline-block mr-1.5 -mt-px" />
            Your couple link
          </Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={coupleLink}
              className="bg-card border-border text-foreground text-sm font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCouple}
              className="shrink-0 text-muted-foreground"
            >
              {copiedCouple ? (
                <CheckIcon className="size-4 text-emerald-400" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground/60 text-xs mt-2 leading-relaxed">
            This link includes your couple secret for managing photos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
