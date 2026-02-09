"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { tryCatch } from "~/utils/try-catch";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

const EventEditFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  date: z.date().or(z.undefined()),
});

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  coupleSecret: string;
  name: string;
  date?: number;
}

export function EventEditDialog({
  open,
  onOpenChange,
  eventId,
  coupleSecret,
  name,
  date,
}: EventEditDialogProps) {
  const updateEvent = useMutation(api.events.update);

  const form = useForm({
    defaultValues: {
      name,
      date: date ? new Date(date) : (undefined as Date | undefined),
    },
    validators: {
      onSubmit: EventEditFormSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await tryCatch(
        updateEvent({
          eventId,
          coupleSecret,
          name: value.name.trim(),
          date: value.date?.getTime(),
        }),
      );

      if (error) {
        toast.error("Failed to update event");
        return;
      }

      toast.success("Event updated");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader className="items-center">
          <DialogTitle className="text-base font-light tracking-wide">
            Edit Event
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80">
            Update the event name or date
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-muted-foreground text-xs tracking-wider uppercase mb-2"
                  >
                    Event Name
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground/60 h-12 text-base"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="date">
            {(field) => (
              <Field>
                <FieldLabel className="text-muted-foreground text-xs tracking-wider uppercase mb-2">
                  Date{" "}
                  <span className="text-muted-foreground/60 normal-case tracking-normal">
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
                        "bg-card border-border hover:bg-primary/10 hover:text-primary",
                        field.state.value
                          ? "text-foreground"
                          : "text-muted-foreground/60",
                      )}
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full h-12 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
