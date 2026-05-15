"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeMermaidDiagram } from "@/lib/sanitize-mermaid";
import { toPng } from "html-to-image";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void | Promise<void>;
  render: (id: string, txt: string) => Promise<{ svg: string }>;
};

const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
  flowchart: {
    useMaxWidth: false,
    // SVG <text> labels export reliably; htmlLabels uses <foreignObject> and canvas/clipboard drops text.
    htmlLabels: false,
    curve: "basis",
    padding: 18,
    nodeSpacing: 44,
    rankSpacing: 56,
  },
  themeVariables: {
    darkMode: true,
    background: "#18181b",
    primaryColor: "#06b6d4",
    primaryTextColor: "#f4f4f5",
    lineColor: "#52525b",
    fontSize: "13px",
  },
} as const;

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5] as const;

function normalizeDiagram(diagram: string): string {
  return sanitizeMermaidDiagram(diagram);
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

function applyScaleToSvg(svg: SVGSVGElement, natural: { width: number; height: number }, scale: number) {
  const displayWidth = Math.ceil(natural.width * scale);
  const displayHeight = Math.ceil(natural.height * scale);
  svg.removeAttribute("style");
  svg.setAttribute("width", String(displayWidth));
  svg.setAttribute("height", String(displayHeight));
  svg.style.width = `${displayWidth}px`;
  svg.style.height = `${displayHeight}px`;
  svg.style.maxWidth = "none";
}

function scalePreview(container: HTMLElement) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  const natural = getSvgDimensions(svg);
  const pad = 32;
  const containerWidth = Math.max(container.clientWidth - pad, 280);
  const maxHeight = 200;

  let scale = containerWidth / natural.width;
  if (natural.height * scale > maxHeight) {
    scale = maxHeight / natural.height;
  }
  scale = Math.min(Math.max(scale, 0.35), 1);

  applyScaleToSvg(svg, natural, scale);
}

function scaleModalFit(container: HTMLElement, zoom: number) {
  const svg = container.querySelector("svg");
  if (!svg) return;

  const natural = getSvgDimensions(svg);
  const pad = 32;
  const viewWidth = Math.max(container.clientWidth - pad, 320);
  const viewHeight = Math.max(container.clientHeight - pad, 240);

  let scale = Math.min(viewWidth / natural.width, viewHeight / natural.height);
  scale = Math.min(Math.max(scale, 0.5), 2) * zoom;

  applyScaleToSvg(svg, natural, scale);
}

/** Clone only — never mutate the diagram shown in the UI. */
function cloneSvgForExport(svg: SVGSVGElement): SVGSVGElement {
  return svg.cloneNode(true) as SVGSVGElement;
}

function applyLightExportTheme(clonedSvg: SVGSVGElement): { svgData: string; width: number; height: number } {
  const { width, height } = getSvgDimensions(clonedSvg);
  clonedSvg.setAttribute("width", String(width));
  clonedSvg.setAttribute("height", String(height));
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.style.background = "#ffffff";
  clonedSvg.style.color = "#1a1a1a";

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(width));
  bg.setAttribute("height", String(height));
  bg.setAttribute("fill", "#ffffff");
  clonedSvg.insertBefore(bg, clonedSvg.firstChild);

  // Edge labels may use foreignObject (HTML); theme so light PNG/SVG export is readable.
  clonedSvg.querySelectorAll("foreignObject").forEach((fo) => {
    const html = fo as SVGForeignObjectElement;
    html.style.color = "#1a1a1a";
    html.querySelectorAll("*").forEach((child) => {
      const el = child as HTMLElement;
      el.style.color = "#1a1a1a";
      el.style.setProperty("-webkit-text-fill-color", "#1a1a1a", "important");
      el.style.backgroundColor = "transparent";
    });
  });

  clonedSvg.querySelectorAll("text, tspan").forEach((el) => {
    const node = el as SVGElement;
    node.style.fill = "#1a1a1a";
    node.setAttribute("fill", "#1a1a1a");
    node.style.setProperty("fill", "#1a1a1a", "important");
  });

  clonedSvg.querySelectorAll(".node rect, .node circle, .node polygon, .cluster rect").forEach((el) => {
    const node = el as SVGElement;
    node.style.fill = "#f4f4f5";
    node.style.stroke = "#d4d4d8";
    node.setAttribute("fill", "#f4f4f5");
    node.setAttribute("stroke", "#d4d4d8");
  });

  clonedSvg.querySelectorAll(".edgePath path, .arrowheadPath, .flowchart-link").forEach((el) => {
    const node = el as SVGElement;
    node.style.stroke = "#71717a";
    node.setAttribute("stroke", "#71717a");
    const fill = node.getAttribute("fill");
    if (fill && fill !== "none") {
      node.style.fill = "#71717a";
      node.setAttribute("fill", "#71717a");
    }
  });

  clonedSvg.querySelectorAll(".edgeLabel text, .label text, .nodeLabel text").forEach((el) => {
    const node = el as SVGElement;
    node.style.fill = "#1a1a1a";
    node.setAttribute("fill", "#1a1a1a");
  });

  const svgData = new XMLSerializer().serializeToString(clonedSvg);

  return { svgData, width, height };
}

function prepareLightExportSvg(svg: SVGSVGElement): { svgData: string; width: number; height: number } {
  return applyLightExportTheme(cloneSvgForExport(svg));
}

/**
 * Rasterize via html-to-image (avoids Canvas drawImage+taint issues with SVG foreignObject while keeping labels).
 */
async function lightExportSvgToPngBlob(svg: SVGSVGElement): Promise<Blob | null> {
  const { svgData, width, height } = prepareLightExportSvg(svg);
  if (!width || !height || !svgData.trim()) return null;

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.boxSizing = "border-box";
  host.style.position = "fixed";
  host.style.left = "-99999px";
  host.style.top = "0";
  host.style.margin = "0";
  host.style.padding = "0";
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  host.style.overflow = "hidden";
  host.style.backgroundColor = "#ffffff";
  host.innerHTML = svgData;

  const svgEl = host.querySelector("svg");
  if (!svgEl) {
    return null;
  }

  svgEl.setAttribute("width", String(width));
  svgEl.setAttribute("height", String(height));
  svgEl.style.width = `${width}px`;
  svgEl.style.height = `${height}px`;
  svgEl.style.maxWidth = "none";
  svgEl.style.display = "block";

  document.body.appendChild(host);

  try {
    const dataUrl = await toPng(host, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      cacheBust: true,
      width,
      height,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch {
    return null;
  } finally {
    host.remove();
  }
}

export function MermaidDiagram({
  diagram,
  systemName,
}: {
  diagram: string;
  systemName?: string;
}) {
  const previewRef = React.useRef<HTMLDivElement>(null);
  const exportRef = React.useRef<HTMLDivElement>(null);
  const [modalContainer, setModalContainer] = React.useState<HTMLDivElement | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [normalizedSource, setNormalizedSource] = React.useState("");
  const [svgMarkup, setSvgMarkup] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [zoomIndex, setZoomIndex] = React.useState(1);

  const downloadBase = `${fileSlug(systemName)}-diagram`;
  const zoom = ZOOM_STEPS[zoomIndex];

  const paintModalDiagram = React.useCallback(() => {
    if (!modalContainer || !svgMarkup) return;

    if (!modalContainer.querySelector("svg")) {
      modalContainer.innerHTML = svgMarkup;
    }
    scaleModalFit(modalContainer, zoom);
  }, [modalContainer, svgMarkup, zoom]);

  const setModalContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setModalContainer(node);
      if (!node || !modalOpen || !svgMarkup) return;

      node.innerHTML = svgMarkup;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!node || !svgMarkup) return;
          if (!node.querySelector("svg")) node.innerHTML = svgMarkup;
          scaleModalFit(node, zoom);
        });
      });
    },
    [modalOpen, svgMarkup, zoom],
  );

  React.useEffect(() => {
    let cancelled = false;
    setSvgMarkup(null);
    if (previewRef.current) previewRef.current.innerHTML = "";
    if (exportRef.current) exportRef.current.innerHTML = "";

    const diagramCode = normalizeDiagram(diagram);
    setNormalizedSource(diagramCode);

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const mod = await import("mermaid");
        const mermaid = mod.default as unknown as MermaidApi;
        await Promise.resolve(mermaid.initialize(MERMAID_CONFIG));

        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, diagramCode);
        if (cancelled) return;

        setSvgMarkup(svg);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not render Mermaid diagram");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [diagram]);

  React.useEffect(() => {
    if (!svgMarkup) return;

    if (exportRef.current) {
      exportRef.current.innerHTML = svgMarkup;
    }
    if (previewRef.current) {
      previewRef.current.innerHTML = svgMarkup;
      scalePreview(previewRef.current);
    }
  }, [svgMarkup]);

  React.useEffect(() => {
    if (!modalOpen) return;
    paintModalDiagram();
    const id = requestAnimationFrame(() => paintModalDiagram());
    return () => cancelAnimationFrame(id);
  }, [modalOpen, paintModalDiagram, fullscreen]);

  React.useEffect(() => {
    if (!modalOpen || !modalContainer) return;
    const observer = new ResizeObserver(() => paintModalDiagram());
    observer.observe(modalContainer);
    return () => observer.disconnect();
  }, [modalOpen, modalContainer, paintModalDiagram]);

  React.useEffect(() => {
    if (!svgMarkup || !previewRef.current) return;
    const el = previewRef.current;
    const observer = new ResizeObserver(() => scalePreview(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [svgMarkup]);

  function getExportSvg(): SVGSVGElement | null {
    return exportRef.current?.querySelector("svg") ?? null;
  }

  function handleDownloadSVG() {
    const svg = getExportSvg();
    if (!svg) return;
    const { svgData } = prepareLightExportSvg(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadBase}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPNG() {
    const svg = getExportSvg();
    if (!svg) return;
    const blob = await lightExportSvgToPngBlob(svg);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadBase}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyImage() {
    const svg = getExportSvg();
    if (!svg) return;
    try {
      const blob = await lightExportSvgToPngBlob(svg);
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked
    }
  }

  function openModal() {
    setZoomIndex(1);
    setFullscreen(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFullscreen(false);
  }

  const actionBtnClass = cn(
    "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground",
    "transition-colors hover:border-border hover:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
  );

  const iconBtnClass = cn(
    "inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground",
    "transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
  );

  return (
    <div className="space-y-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Architecture diagram</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openModal}
            disabled={loading || !!error || !svgMarkup}
            className={actionBtnClass}
            aria-label="Expand diagram"
          >
            <Maximize2 className="size-3.5" aria-hidden />
            Expand
          </button>
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

      {loading ? <p className="text-sm text-muted-foreground">Rendering diagram…</p> : null}
      {error ? (
        <div className="space-y-2">
          <p className="text-sm text-red-400">{error}</p>
          {normalizedSource ? (
            <pre className="overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {normalizedSource}
            </pre>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={openModal}
        disabled={loading || !!error || !svgMarkup}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border border-border bg-background text-left",
          "transition-colors hover:border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        aria-label="Open architecture diagram"
      >
        <div
          ref={previewRef}
          className="diagram-host max-h-[13rem] overflow-hidden p-3 [&_svg]:mx-auto [&_svg]:block [&_svg]:max-w-none"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-opacity group-hover:bg-background/40 group-hover:opacity-100 group-focus-visible:bg-background/40 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <Maximize2 className="size-3.5" aria-hidden />
            Expand diagram
          </span>
        </div>
      </button>

      <p className="text-xs text-muted-foreground">Click the preview or use Expand for a larger view with zoom.</p>

      {/* Hidden source for full-resolution exports */}
      <div ref={exportRef} className="pointer-events-none fixed -left-[9999px] opacity-0" aria-hidden />

      <DialogPrimitive.Root open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
              "transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          />
          <DialogPrimitive.Popup
            className={cn(
              "fixed z-50 flex flex-col border border-border bg-card shadow-2xl shadow-black/50",
              "transition duration-200 data-ending-style:scale-[0.98] data-ending-style:opacity-0",
              "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
              fullscreen
                ? "inset-0 rounded-none"
                : "top-1/2 left-1/2 h-[min(85vh,52rem)] w-[min(96vw,72rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <DialogPrimitive.Title className="text-sm font-semibold text-foreground">
                Architecture diagram
                {systemName ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{systemName}</span>
                ) : null}
              </DialogPrimitive.Title>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={iconBtnClass}
                  disabled={zoomIndex <= 0}
                  onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                  aria-label="Zoom out"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-[3rem] text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className={iconBtnClass}
                  disabled={zoomIndex >= ZOOM_STEPS.length - 1}
                  onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
                  aria-label="Zoom in"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  className={iconBtnClass}
                  onClick={() => setZoomIndex(1)}
                  aria-label="Reset zoom to fit"
                >
                  Fit
                </button>
                <button
                  type="button"
                  className={iconBtnClass}
                  onClick={() => setFullscreen((f) => !f)}
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
                <DialogPrimitive.Close
                  render={<Button type="button" variant="ghost" size="icon-sm" className="shrink-0" />}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
        </div>
      </div>

            <div
              ref={setModalContainerRef}
              className="diagram-host min-h-0 flex-1 overflow-auto bg-background p-4 [&_svg]:mx-auto [&_svg]:block [&_svg]:max-w-none"
            />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
