"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ctaButtonClass, selectItemHighlightClass } from "@/lib/theme-badges";
import {
  DEFAULT_INDUSTRY,
  DEFAULT_SCALE,
  DEFAULT_TECH_STACK,
  INDUSTRY_OPTIONS,
  SCALE_OPTIONS,
  TECH_STACK_OPTIONS,
} from "@/lib/prompt-options";
import type { PromptPayload } from "./types";

type PromptInputProps = {
  disabled: boolean;
  onSubmit: (payload: PromptPayload) => Promise<void> | void;
};

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput({ disabled, onSubmit }, ref) {
    const [description, setDescription] = React.useState("");
    const [techStack, setTechStack] = React.useState<string>(DEFAULT_TECH_STACK);
    const [scale, setScale] = React.useState<string>(DEFAULT_SCALE);
    const [industry, setIndustry] = React.useState<string>(DEFAULT_INDUSTRY);

    async function submit() {
      await onSubmit({ description, techStack, scale, industry });
    }

    const fieldClass =
      "border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:ring-cyan-500/40";

    const itemClass = selectItemHighlightClass;

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="desc" className="text-sm font-medium text-foreground/90">
            Describe the system you want to build
          </Label>
          <Textarea
            ref={ref}
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            rows={8}
            required
            disabled={disabled}
            placeholder="E.g. An e-commerce platform where vendors list products, customers buy, we take a fee, and we notify both parties at every step..."
            className={cn("resize-none font-mono text-sm leading-relaxed", fieldClass)}
          />
          <p className="text-xs text-muted-foreground">Minimum 10 characters. Plain language works best.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tech stack">
            <Select value={techStack} onValueChange={(v) => setTechStack(v ?? DEFAULT_TECH_STACK)} disabled={disabled}>
              <SelectTrigger className={cn("w-full", fieldClass)}>
                <SelectValue placeholder="Pick stack" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground shadow-xl shadow-black/40">
                {TECH_STACK_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className={itemClass}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Expected scale">
            <Select value={scale} onValueChange={(v) => setScale(v ?? DEFAULT_SCALE)} disabled={disabled}>
              <SelectTrigger className={cn("w-full", fieldClass)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground shadow-xl shadow-black/40">
                {SCALE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className={itemClass}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Industry">
            <Select value={industry} onValueChange={(v) => setIndustry(v ?? DEFAULT_INDUSTRY)} disabled={disabled}>
              <SelectTrigger className={cn("w-full", fieldClass)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground shadow-xl shadow-black/40">
                {INDUSTRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option} className={itemClass}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={disabled || description.trim().length < 10}
          className={cn(
            "w-full rounded-lg font-semibold sm:w-auto sm:min-w-[240px]",
            ctaButtonClass,
          )}
          onClick={() => void submit()}
        >
          {disabled ? "Generating…" : "Generate Architecture"}
        </Button>
      </div>
    );
  },
);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
