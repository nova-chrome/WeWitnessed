"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { CreateEventResult } from "../types/event";

type Status = "idle" | "submitting" | "success";

const EventCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  date: z.string(),
});

export function EventCreateForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CreateEventResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const createEvent = useMutation(api.events.create);

  const form = useForm({
    defaultValues: {
      name: "",
      date: "",
    },
    validators: {
      onSubmit: EventCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setStatus("submitting");

      const dateTimestamp = value.date
        ? new Date(value.date).getTime()
        : undefined;
      const res = await createEvent({
        name: value.name.trim(),
        date: dateTimestamp,
      });

      localStorage.setItem(`wewitnessed:couple:${res.slug}`, res.coupleSecret);

      setResult(res);
      setStatus("success");
    },
  });

  function handleCopy() {
    if (!result) return;
    const link = `${window.location.origin}/e/${result.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    form.reset();
    setStatus("idle");
    setResult(null);
    setCopied(false);
    setSecretRevealed(false);
  }

  if (status === "success" && result) {
    const shareableLink = `${window.location.origin}/e/${result.slug}`;

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
            {form.state.values.name}
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

        {/* Shareable link */}
        <div className="mb-6">
          <Label className="text-neutral-500 text-xs tracking-wider uppercase mb-2 block">
            Share this link
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
              onClick={handleCopy}
              className="shrink-0 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
            >
              {copied ? (
                <CheckIcon className="size-4 text-emerald-400" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Couple secret */}
        <div className="mb-10">
          <Label className="text-neutral-500 text-xs tracking-wider uppercase mb-2 block">
            <KeyRoundIcon className="size-3 inline-block mr-1.5 -mt-px" />
            Your couple secret
          </Label>
          <button
            type="button"
            onClick={() => setSecretRevealed(true)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm border transition-colors",
              "bg-neutral-900 border-neutral-800",
              secretRevealed
                ? "font-mono text-neutral-300 cursor-text"
                : "text-neutral-600 cursor-pointer hover:border-neutral-700",
            )}
          >
            {secretRevealed ? result.coupleSecret : "Tap to reveal"}
          </button>
          <p className="text-neutral-600 text-xs mt-2 leading-relaxed">
            Save this — you&apos;ll need it to manage your event.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleReset}
            variant="ghost"
            className="text-neutral-500 hover:text-neutral-300 text-xs tracking-wider uppercase"
          >
            Create Another Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="w-full max-w-sm animate-in fade-in duration-300"
    >
      <div className="space-y-6 mb-10">
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-neutral-500 text-xs tracking-wider uppercase mb-2"
                >
                  Event Name
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Sarah & Mike's Wedding"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  autoFocus
                  className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-neutral-700 focus-visible:border-neutral-700 h-12 text-base"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="date">
          {(field) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-neutral-500 text-xs tracking-wider uppercase mb-2"
              >
                Date{" "}
                <span className="text-neutral-700 normal-case tracking-normal">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="bg-neutral-900 border-neutral-800 text-neutral-100 focus-visible:ring-neutral-700 focus-visible:border-neutral-700 h-12 text-base [color-scheme:dark]"
              />
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit]) => (
          <Button
            type="submit"
            disabled={!canSubmit || status === "submitting"}
            className="w-full h-12 bg-neutral-100 text-neutral-950 font-medium text-sm tracking-wider uppercase hover:bg-white disabled:opacity-40 transition-all"
          >
            {status === "submitting" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <>
                <SparklesIcon className="size-4" />
                <span>Create Event</span>
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
