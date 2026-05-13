import type { Architecture } from "@/types/architecture";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeDiagram(diagram: string): string {
  return diagram.replace(/\\n/g, "\n").replace(/\\t/g, "  ").trim();
}

export async function renderMermaidImageDataUrl(diagram: string): Promise<string | null> {
  try {
    const mod = await import("mermaid");
    const mermaid = mod.default as {
      initialize: (config: Record<string, unknown>) => void;
      render: (id: string, txt: string) => Promise<{ svg: string }>;
    };

    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "Inter, -apple-system, sans-serif",
    });

    const { svg } = await mermaid.render(`pdf-mmd-${Date.now()}`, normalizeDiagram(diagram));
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  } catch {
    return null;
  }
}

const PDF_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .pdf-root {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #ffffff;
    color: #18181b;
    padding: 48px;
    width: 794px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 24px;
    border-bottom: 2px solid #f4f4f5;
    margin-bottom: 32px;
  }
  .brand {
    font-size: 14px;
    font-weight: 700;
    color: #06b6d4;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .date { font-size: 12px; color: #a1a1aa; }
  .title {
    font-size: 32px;
    font-weight: 700;
    color: #09090b;
    margin-bottom: 4px;
    line-height: 1.2;
  }
  .subtitle {
    font-size: 13px;
    color: #71717a;
    margin-bottom: 32px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .score-banner {
    background: #f0fdfe;
    border: 1px solid #a5f3fc;
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
  }
  .score-number {
    font-size: 48px;
    font-weight: 800;
    color: #06b6d4;
    line-height: 1;
    flex-shrink: 0;
  }
  .score-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #71717a;
    margin-bottom: 4px;
  }
  .score-text { font-size: 13px; color: #3f3f46; line-height: 1.5; }
  .summary-card {
    background: #fafafa;
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 32px;
    font-size: 14px;
    line-height: 1.6;
    color: #3f3f46;
  }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #71717a;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e4e7;
  }
  .section-gap { margin-top: 32px; }
  .axis-card {
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .axis-name {
    font-size: 15px;
    font-weight: 700;
    color: #06b6d4;
    font-family: "Courier New", Courier, monospace;
    margin-bottom: 6px;
  }
  .axis-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a1a1aa;
    margin-top: 10px;
    margin-bottom: 3px;
  }
  .axis-value { font-size: 13px; color: #3f3f46; line-height: 1.5; }
  .axis-muted { color: #71717a; font-size: 12px; margin-bottom: 8px; }
  .method-code {
    background: #f4f4f5;
    border-radius: 4px;
    padding: 4px 8px;
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    color: #18181b;
    margin-bottom: 4px;
    display: block;
  }
  .axis-row { display: flex; gap: 24px; margin-top: 10px; }
  .service-card {
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .service-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .service-name {
    font-size: 15px;
    font-weight: 700;
    color: #18181b;
    margin-bottom: 4px;
  }
  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .badge-high { background: #dcfce7; color: #16a34a; }
  .badge-medium { background: #fef9c3; color: #ca8a04; }
  .badge-low { background: #fee2e2; color: #dc2626; }
  .depends-tag {
    display: inline-block;
    background: #ecfeff;
    border: 1px solid #a5f3fc;
    color: #0e7490;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: "Courier New", Courier, monospace;
    margin-right: 4px;
    margin-top: 4px;
  }
  .diagram-wrap {
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 32px;
    background: #fafafa;
    text-align: center;
    page-break-inside: avoid;
  }
  .diagram-wrap img { max-width: 100%; height: auto; }
  .order-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f4f4f5;
    font-size: 13px;
    color: #3f3f46;
    line-height: 1.5;
  }
  .order-num {
    width: 24px;
    height: 24px;
    background: #f4f4f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #71717a;
    flex-shrink: 0;
  }
  .arrow { color: #06b6d4; font-size: 16px; line-height: 1.2; flex-shrink: 0; }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #f4f4f5;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #a1a1aa;
  }
`;

function stabilityBadgeClass(stability: string): string {
  if (stability === "high") return "badge-high";
  if (stability === "medium") return "badge-medium";
  return "badge-low";
}

export async function buildPdfDocumentElement(architecture: Architecture): Promise<HTMLDivElement> {
  const score = Math.min(100, Math.max(1, architecture.futureProofScore));
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const diagramSrc = await renderMermaidImageDataUrl(architecture.mermaidDiagram);
  const diagramSection = diagramSrc
    ? `<div class="section-title section-gap">Architecture Diagram</div>
       <div class="diagram-wrap"><img src="${diagramSrc}" alt="Architecture diagram" /></div>`
    : "";

  const axesHtml = architecture.volatilityAxes
    .map(
      (axis) => `
      <div class="axis-card">
        <div class="axis-name">${escapeHtml(axis.interfaceName)}</div>
        <div class="axis-muted">${escapeHtml(axis.name)}</div>
        <div class="axis-label">Why Volatile</div>
        <div class="axis-value">${escapeHtml(axis.reason)}</div>
        <div class="axis-label">Change Scenario</div>
        <div class="axis-value">${escapeHtml(axis.changeScenario)}</div>
        <div class="axis-label">Methods</div>
        ${axis.methods.map((m) => `<code class="method-code">${escapeHtml(m)}</code>`).join("")}
        <div class="axis-row">
          <div>
            <div class="axis-label">Ship Today</div>
            <div class="axis-value">${escapeHtml(axis.currentImplementation)}</div>
          </div>
          <div>
            <div class="axis-label">Alternatives</div>
            <div class="axis-value">${escapeHtml(axis.alternativeImplementations.join(", "))}</div>
          </div>
        </div>
      </div>`,
    )
    .join("");

  const servicesHtml = architecture.coreServices
    .map(
      (service) => `
      <div class="service-card">
        <div class="service-header">
          <div class="service-name">${escapeHtml(service.name)}</div>
          <span class="badge ${stabilityBadgeClass(service.stability)}">${escapeHtml(service.stability)} stability</span>
        </div>
        <div class="axis-value" style="margin-top:6px">${escapeHtml(service.responsibility)}</div>
        <div class="axis-label">Depends On</div>
        <div>
          ${service.dependsOn.map((d) => `<span class="depends-tag">${escapeHtml(d)}</span>`).join("")}
        </div>
      </div>`,
    )
    .join("");

  const orderHtml = architecture.implementationOrder
    .map(
      (item, i) => `
      <div class="order-item">
        <div class="order-num">${i + 1}</div>
        <div>${escapeHtml(item)}</div>
      </div>`,
    )
    .join("");

  const recsHtml = architecture.technicalRecommendations
    .map(
      (rec) => `
      <div class="order-item">
        <div class="arrow">→</div>
        <div>${escapeHtml(rec)}</div>
      </div>`,
    )
    .join("");

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;left:0;top:0;z-index:-1;width:794px;background:#fff;pointer-events:none;";
  wrapper.innerHTML = `
    <style>${PDF_STYLES}</style>
    <div class="pdf-root">
      <div class="header">
        <div class="brand">⚡ Archivolt</div>
        <div class="date">Generated ${escapeHtml(generatedDate)}</div>
      </div>
      <div class="title">${escapeHtml(architecture.systemName)}</div>
      <div class="subtitle">Architecture Blueprint · Volatility-Based Decomposition</div>
      <div class="score-banner">
        <div class="score-number">${score}</div>
        <div>
          <div class="score-label">Future-Proof Score</div>
          <div class="score-text">${escapeHtml(architecture.futureProofExplanation)}</div>
        </div>
      </div>
      <div class="section-title">Executive Summary</div>
      <div class="summary-card">${escapeHtml(architecture.summary)}</div>
      <div class="section-title">Volatility Axes (${architecture.volatilityAxes.length})</div>
      ${axesHtml}
      ${diagramSection}
      <div class="section-title section-gap">Core Services (${architecture.coreServices.length})</div>
      ${servicesHtml}
      <div class="section-title section-gap">Implementation Sequence</div>
      ${orderHtml}
      <div class="section-title section-gap">Technical Recommendations</div>
      ${recsHtml}
      <div class="footer">
        <span>⚡ Archivolt · archivolt.dev</span>
        <span>Volatility-Based Decomposition Architecture</span>
      </div>
    </div>
  `;

  return wrapper;
}

export function slugifyPdfName(systemName: string): string {
  return `${systemName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "architecture"}.pdf`;
}
