"use client";

import * as React from "react";
import type { Architecture } from "@/types/architecture";
import { Button } from "@/components/ui/button";

type Props = {
  architecture: Architecture;
};

export function ExportButton({ architecture }: Props) {
  const [busy, setBusy] = React.useState(false);

  async function handleClick() {
    setBusy(true);
    let mount: HTMLDivElement | null = null;

    try {
      const [{ toCanvas }, { jsPDF }, pdfExport] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
        import("@/lib/pdf-export"),
      ]);

      mount = await pdfExport.buildPdfDocumentElement(architecture);
      document.body.appendChild(mount);

      const root = mount.querySelector(".pdf-root") as HTMLElement | null;
      if (!root) throw new Error("PDF template missing");

      const images = Array.from(root.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      const canvas = await toCanvas(root, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pageWidth;
      const printableHeight = pageHeight;
      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      let offsetY = 0;
      let page = 0;

      while (offsetY < imgHeight) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -offsetY, imgWidth, imgHeight);
        offsetY += printableHeight;
        page += 1;
      }

      pdf.save(pdfExport.slugifyPdfName(architecture.systemName));
    } catch (e) {
      console.error(e);
      window.alert("Could not export PDF. Please try again.");
    } finally {
      if (mount?.parentNode) mount.parentNode.removeChild(mount);
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={busy}
      className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white"
      onClick={() => void handleClick()}
    >
      {busy ? "Generating PDF…" : "Export PDF"}
    </Button>
  );
}
