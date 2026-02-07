"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { CreateEventResult } from "../types/event";
import { EventCreateSuccess } from "./event-create-success";

type Status = "idle" | "submitting" | "success";

const EventCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  date: z.date().or(z.undefined()),
});

export function EventCreateForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CreateEventResult | null>(null);

  const createEvent = useMutation(api.events.create);

  const form = useForm({
    defaultValues: {
      name: "",
      date: undefined as Date | undefined,
    },
    validators: {
      onSubmit: EventCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      setStatus("submitting");

      const dateTimestamp = value.date ? value.date.getTime() : undefined;
      const res = await createEvent({
        name: value.name.trim(),
        date: dateTimestamp,
      });

      localStorage.setItem(`wewitnessed:couple:${res.slug}`, res.coupleSecret);

      setResult(res);
      setStatus("success");
    },
  });

  function handleReset() {
    form.reset();
    setStatus("idle");
    setResult(null);
  }

  if (status === "success" && result) {
    return (
      <EventCreateSuccess
        result={result}
        eventName={form.state.values.name}
        onReset={handleReset}
      />
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
                className="text-neutral-500 text-xs tracking-wider uppercase mb-2"
              >
                Date{" "}
                <span className="text-neutral-700 normal-case tracking-normal">
                  (optional)
                </span>
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!field.state.value}
                    className={cn(
                      "w-full h-12 justify-start text-left text-base font-normal",
                      "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 focus-visible:ring-neutral-700 focus-visible:border-neutral-700",
                      field.state.value
                        ? "text-neutral-100"
                        : "text-neutral-600",
                    )}
                  >
                    <CalendarIcon className="size-4 text-neutral-500" />
                    {field.state.value
                      ? format(field.state.value, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.state.value}
                    onSelect={(date) => field.handleChange(date)}
                    disabled={{ before: startOfDay(new Date()) }}
                  />
                </PopoverContent>
              </Popover>
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
