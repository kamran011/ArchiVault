"use client";

import * as React from "react";
import { Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void | Promise<void>;
  render: (id: string, txt: string) => Promise<{ svg: string }>;
};

let mermaidInitialized = false;

function normalizeDiagram(diagram: string): string {
  return diagram.replace(/\\n/g, "\n").replace(/\\t/g, "  ").trim();
}

function fileSlug(systemName?: string): string {
  const base = (systemName || "architecture").trim().replace(/[^\w.-]+/g, "-");
  return base || "architecture";
}

function getSvgDimensions(svg: SVGSVGElement): { width: number; height: number } {
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const width = Number.parseFloat(svg.getAttribute("width") || "");
  const height = Number.parseFloat(svg.getAttribute("height") || "");
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }
  const box = svg.getBBox();
  return { width: Math.max(box.width, 1), height: Math.max(box.height, 1) };
}

function prepareExportSvg(svg: SVGSVGElement): { svgData: string; width: number; height: number } {
  const { width, height } = getSvgDimensions(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "#09090b");
  clone.insertBefore(bg, clone.firstChild);

  let svgData = new XMLSerializer().serializeToString(clone);
  svgData = svgData.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");

  return { svgData, width, height };
}

async function diagramToPngBlob(container: HTMLElement): Promise<Blob | null> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(container, {
    backgroundColor: "#09090b",
    pixelRatio: 2,
    cacheBust: true,
  });
  const response = await fetch(dataUrl);
  return response.blob();
}

export function MermaidDiagram({
  diagram,
  systemName,
}: {
  diagram: string;
  systemName?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [normalizedSource, setNormalizedSource] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const downloadBase = `${fileSlug(systemName)}-diagram`;

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    let cancelled = false;
    el.innerHTML = "";

    const diagramCode = normalizeDiagram(diagram);
    setNormalizedSource(diagramCode);

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const mod = await import("mermaid");
        const mermaid = mod.default as unknown as MermaidApi;

        if (!mermaidInitialized) {
          await Promise.resolve(
            mermaid.initialize({
              startOnLoad: false,
              theme: "dark",
              securityLevel: "loose",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
              themeVariables: {
                darkMode: true,
                background: "#18181b",
                primaryColor: "#06b6d4",
                primaryTextColor: "#f4f4f5",
                lineColor: "#52525b",
              },
            }),
          );
          mermaidInitialized = true;
        }

        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, diagramCode);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = "";
          setError(e instanceof Error ? e.message : "Could not render Mermaid diagram");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [diagram]);

  function getSvgElement(): SVGSVGElement | null {
    return containerRef.current?.querySelector("svg") ?? null;
  }

  function handleDownloadSVG() {
    const svg = getSvgElement();
    if (!svg) return;
    const { svgData } = prepareExportSvg(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadBase}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPNG() {
    const container = containerRef.current;
    if (!container?.querySelector("svg")) return;
    const blob = await diagramToPngBlob(container);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadBase}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyImage() {
    const container = containerRef.current;
    if (!container?.querySelector("svg")) return;
    try {
      const blob = await diagramToPngBlob(container);
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked without gesture or secure context
    }
  }

  const actionBtnClass = cn(
    "flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400",
    "transition-colors hover:border-zinc-500 hover:text-white",
    "disabled:pointer-events-none disabled:opacity-40",
  );

  return (
    <div className="space-y-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Architecture diagram</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCopyImage()}
            disabled={loading || !!error}
            className={actionBtnClass}
          >
            <Copy className="size-3.5" aria-hidden />
            {copied ? "Copied!" : "Copy image"}
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadPNG()}
            disabled={loading || !!error}
            className={actionBtnClass}
          >
            <Download className="size-3.5" aria-hidden />
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadSVG}
            disabled={loading || !!error}
            className={actionBtnClass}
          >
            <Download className="size-3.5" aria-hidden />
            Download SVG
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Rendering diagram…</p> : null}
      {error ? (
        <div className="space-y-2">
          <p className="text-sm text-red-400">{error}</p>
          {normalizedSource ? (
            <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-500">
              {normalizedSource}
            </pre>
          ) : null}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="diagram-host overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 [&_svg]:mx-auto [&_svg]:max-w-none"
      />
    </div>
  );
}
