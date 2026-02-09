"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { format, startOfDay } from "date-fns";
import {
  CalendarIcon,
  ImagePlusIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { tryCatch } from "~/utils/try-catch";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import { EventDeleteDialog } from "./event-delete-dialog";

const EventEditFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  date: z.date().or(z.undefined()),
});

interface EventEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  coupleSecret: string;
  name: string;
  date?: number;
  coverPhotoUrl: string | null;
}

export function EventEditDrawer({
  open,
  onOpenChange,
  eventId,
  coupleSecret,
  name,
  date,
  coverPhotoUrl,
}: EventEditDrawerProps) {
  const updateEvent = useMutation(api.events.update);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const setCoverPhoto = useMutation(api.events.setCoverPhoto);
  const removeCoverPhotoMutation = useMutation(api.events.removeCoverPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isRemovingCover, setIsRemovingCover] = useState(false);

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);
    const { error } = await tryCatch(
      (async () => {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error("Upload failed");
        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };
        await setCoverPhoto({ eventId, coupleSecret, storageId });
      })(),
    );
    setIsUploadingCover(false);

    if (error) {
      toast.error("Failed to upload cover photo");
      return;
    }
    toast.success("Cover photo updated");
  }

  async function handleCoverRemove() {
    setIsRemovingCover(true);
    const { error } = await tryCatch(
      removeCoverPhotoMutation({ eventId, coupleSecret }),
    );
    setIsRemovingCover(false);

    if (error) {
      toast.error("Failed to remove cover photo");
      return;
    }
    toast.success("Cover photo removed");
  }

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-base font-light tracking-wide">
            Edit Event
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground/80">
            Update the event name or date
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-safe-or-6">
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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

          <Separator className="my-4" />

          <div className="space-y-3">
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Share Preview Photo
            </p>
            <p className="text-muted-foreground/60 text-xs">
              This photo appears when you share the event link on iMessage,
              WhatsApp, or social media.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
            />

            {coverPhotoUrl ? (
              <div className="relative rounded-md overflow-hidden aspect-[1200/630] bg-muted">
                <Image
                  src={coverPhotoUrl}
                  alt="Cover photo preview"
                  fill
                  sizes="280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isUploadingCover}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingCover ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <ImagePlusIcon className="size-3.5" />
                    )}
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isRemovingCover}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCoverRemove}
                  >
                    {isRemovingCover ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-3.5" />
                    )}
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingCover}
                className="w-full h-20 border-dashed border-border bg-card hover:bg-primary/10 hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingCover ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ImagePlusIcon className="size-4" />
                )}
                Upload cover photo
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Danger Zone
            </p>
            <EventDeleteDialog
              eventId={eventId}
              coupleSecret={coupleSecret}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
