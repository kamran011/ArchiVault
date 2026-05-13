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
import type { PromptPayload } from "./types";

type PromptInputProps = {
  disabled: boolean;
  onSubmit: (payload: PromptPayload) => Promise<void> | void;
};

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput({ disabled, onSubmit }, ref) {
    const [description, setDescription] = React.useState("");
    const [techStack, setTechStack] = React.useState("Any");
    const [scale, setScale] = React.useState("Startup");
    const [industry, setIndustry] = React.useState("General");

    async function submit() {
      await onSubmit({ description, techStack, scale, industry });
    }

    const fieldClass =
      "border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-cyan-500/40";

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="desc" className="text-sm font-medium text-zinc-200">
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
          <p className="text-xs text-zinc-500">Minimum 10 characters. Plain language works best.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Scaffold language">
            <Select value={techStack} onValueChange={(v) => setTechStack(v ?? "Any")} disabled={disabled}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Pick language" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C#">C#</SelectItem>
                <SelectItem value="Go">Go</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Expected scale">
            <Select value={scale} onValueChange={(v) => setScale(v ?? "Startup")} disabled={disabled}>
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Industry">
            <Select value={industry} onValueChange={(v) => setIndustry(v ?? "General")} disabled={disabled}>
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Fintech">Fintech</SelectItem>
                <SelectItem value="Healthtech">Healthtech</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="Marketplace">Marketplace</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={disabled || description.trim().length < 10}
          className="w-full rounded-lg bg-cyan-500 font-semibold text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 sm:w-auto sm:min-w-[240px]"
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
      <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</Label>
      {children}
    </div>
  );
}
