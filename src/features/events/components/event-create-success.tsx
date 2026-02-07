"use client";

import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { CreateEventResult } from "../types/event";

interface EventCreateSuccessProps {
  result: CreateEventResult;
  eventName: string;
  onReset: () => void;
}

export function EventCreateSuccess({
  result,
  eventName,
  onReset,
}: EventCreateSuccessProps) {
  const [copiedGuest, setCopiedGuest] = useState(false);
  const [copiedCouple, setCopiedCouple] = useState(false);

  const shareableLink = `${window.location.origin}/e/${result.slug}`;
  const coupleLink = `${shareableLink}?s=${result.coupleSecret}`;

  function handleCopyGuest() {
    navigator.clipboard.writeText(shareableLink);
    setCopiedGuest(true);
    setTimeout(() => setCopiedGuest(false), 2000);
  }

  function handleCopyCouple() {
    navigator.clipboard.writeText(coupleLink);
    setCopiedCouple(true);
    setTimeout(() => setCopiedCouple(false), 2000);
  }

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Success heading */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-neutral-500 text-xs tracking-[0.2em] uppercase mb-4">
          <div className="w-4 h-px bg-neutral-700" />
          Event Created
          <div className="w-4 h-px bg-neutral-700" />
        </div>
        <h2 className="text-2xl font-light text-neutral-100 tracking-wide">
          {eventName}
        </h2>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-sm p-5 shadow-2xl shadow-white/5">
          <QRCodeSVG
            value={shareableLink}
            size={180}
            level="M"
            bgColor="#ffffff"
            fgColor="#0a0a0a"
          />
        </div>
      </div>

      {/* Guest shareable link */}
      <div className="mb-6">
        <Label className="text-neutral-500 text-xs tracking-wider uppercase mb-2 block">
          Guest link
        </Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={shareableLink}
            className="bg-neutral-900 border-neutral-800 text-neutral-300 text-sm font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyGuest}
            className="shrink-0 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
          >
            {copiedGuest ? (
              <CheckIcon className="size-4 text-emerald-400" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Couple management link */}
      <div className="mb-10">
        <Label className="text-neutral-500 text-xs tracking-wider uppercase mb-2 block">
          <KeyRoundIcon className="size-3 inline-block mr-1.5 -mt-px" />
          Your couple link
        </Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={coupleLink}
            className="bg-neutral-900 border-neutral-800 text-neutral-300 text-sm font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyCouple}
            className="shrink-0 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
          >
            {copiedCouple ? (
              <CheckIcon className="size-4 text-emerald-400" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-neutral-600 text-xs mt-2 leading-relaxed">
          Bookmark this — use it to manage photo visibility.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={onReset}
          variant="ghost"
          className="text-neutral-500 hover:text-neutral-300 text-xs tracking-wider uppercase"
        >
          Create Another Event
        </Button>
      </div>
    </div>
  );
}
