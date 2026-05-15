"use client";

import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ExportPdfLocked() {
  return (
    <button
      type="button"
      onClick={() => toast.message("Upgrade to Blueprint to export PDF")}
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "cursor-not-allowed gap-2 border-border text-muted-foreground opacity-60 hover:bg-transparent hover:text-muted-foreground",
      )}
    >
      <Lock className="size-3.5" aria-hidden />
      Export PDF
    </button>
  );
}
