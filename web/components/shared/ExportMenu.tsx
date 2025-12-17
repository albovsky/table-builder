"use client";

import { useEffect, useState } from "react";
import { FileDown, FileText, Copy, Check, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useTravelData } from "@/features/travel/hooks/useTravelData";
import { useAddressData } from "@/features/address/hooks/useAddressData";
import { exportTravelCSV, exportAddressCSV, downloadCSV, copyTravelToClipboard, copyAddressToClipboard } from "@/services/export/csvExporter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/shared/ExportDialog";

export function ExportMenu() {
  const workMode = useStore((s) => s.workMode);
  const { data: travelData } = useTravelData();
  const { data: addressData } = useAddressData();
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportAction, setExportAction] = useState<(() => void) | null>(null);
  const [exportType, setExportType] = useState<"PDF" | "CSV" | "Clipboard">("PDF");

  useEffect(() => {
    setCopied(false);
  }, [workMode]);

  const handleCopy = async () => {
    if (workMode === "travel") {
      await copyTravelToClipboard(travelData);
    } else {
      await copyAddressToClipboard(addressData);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCSV = () => {
    const today = new Date().toISOString().split("T")[0];
    if (workMode === "travel") {
      const csv = exportTravelCSV(travelData);
      downloadCSV(csv, `travel_history_${today}.csv`);
      return;
    }

    const csv = exportAddressCSV(addressData);
    downloadCSV(csv, `address_history_${today}.csv`);
  };

  const handlePDF = async () => {
    const mod = await import("@/services/export/pdfExporter");
    if (workMode === "travel") {
      mod.exportTravelPDF(travelData);
      return;
    }
    mod.exportAddressPDF(addressData);
  };

  const handleExportClick = async (
    type: "PDF" | "CSV" | "Clipboard",
    action: () => void | Promise<void>
  ) => {
    if (type === "Clipboard") {
      await action();
    }

    setExportType(type);
    setExportAction(() => action);
    setExportDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Export
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExportClick("PDF", handlePDF)}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>PDF Document</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportClick("CSV", handleCSV)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>CSV File</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportClick("Clipboard", handleCopy)}>
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            <span>{copied ? "Copied to Clipboard" : "Copy for Sheets"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={() => {
          if (exportAction) {
            exportAction();
          }
        }}
        exportType={exportType}
      />
    </>
  );
}
