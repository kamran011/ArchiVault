"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteGenerationDialog({
  open,
  systemName,
  deleting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  systemName: string;
  deleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (open) {
      const id = window.requestAnimationFrame(() => cancelRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (deleting) return;
    onOpenChange(next);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(100vw-2rem,420px)] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-red-500/20 bg-zinc-900 p-6 shadow-2xl shadow-black/50",
            "transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10"
              aria-hidden
            >
              <Trash2 className="size-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-semibold text-white">
                Delete architecture?
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-zinc-400">
                <span className="break-words font-medium text-zinc-200">{systemName}</span> will be
                removed from your history. This cannot be undone.
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close
              ref={cancelRef}
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                />
              }
              disabled={deleting}
            >
              Cancel
            </DialogPrimitive.Close>
            <Button
              type="button"
              disabled={deleting}
              className="bg-red-600 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              onClick={onConfirm}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
