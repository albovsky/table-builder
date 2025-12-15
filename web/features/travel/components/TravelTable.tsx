"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useTravelData, bulkDeleteTravelEntries, bulkDuplicateTravelEntries, bulkUpdateTravelPurpose, bulkUpdateTravelLocation } from "../hooks/useTravelData";
import { useTravelColumns } from "./TravelColumns";
import { TravelEntry } from "@/db/db";
import { FileDown, FileText, Copy, Check, ChevronDown, Bug } from "lucide-react";
import { useMemo, useState } from "react";
import { exportTravelCSV, downloadCSV, copyTravelToClipboard } from "@/services/export/csvExporter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/shared/ExportDialog";
import { addRandomTravelEntries } from "../hooks/useTravelData";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { useStore } from "@/store/useStore";

export function TravelTable() {
  const { data, updateEntry, addEntry, deleteEntry, duplicateEntry } = useTravelData();
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportAction, setExportAction] = useState<(() => void) | null>(null);
  const [exportType, setExportType] = useState<"PDF" | "CSV" | "Clipboard">("PDF");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const dateFormat = useStore((s) => s.dateFormat);

  const handleRowUpdate = (rowIndex: number, columnId: string, value: unknown) => {
    const row = data[rowIndex];
    if (!row) return;
    updateEntry(row.id, { [columnId]: value });
  };

  const handleExportClick = async (type: "PDF" | "CSV" | "Clipboard", action: () => void | Promise<void>) => {
    // For clipboard, execute immediately to preserve user gesture
    if (type === "Clipboard") {
      await action();
    }
    
    setExportType(type);
    setExportAction(() => action);
    setExportDialogOpen(true);
  };

  const handleCopy = async () => {
      await copyTravelToClipboard(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleCSV = () => {
      const csv = exportTravelCSV(data);
      downloadCSV(csv, `travel_history_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePDF = async () => {
    const mod = await import("@/services/export/pdfExporter");
    mod.exportTravelPDF(data);
  };

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data]
  );

  const columns = useMemo<ColumnDef<TravelEntry>[]>(() => {
    const selectionCol: ColumnDef<TravelEntry> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    };

    const actionCol = {
      id: "actions",
      header: "",
      size: 140,
      cell: ({ row }: { row: { original: TravelEntry } }) => (
        <div className="flex gap-2 justify-end w-full">
          <Button size="sm" variant="outline" onClick={() => duplicateEntry(row.original.id)} title="Duplicate">
            ⧉
          </Button>
          <Button size="sm" variant="outline" onClick={() => deleteEntry(row.original.id)} title="Delete">
            ✕
          </Button>
        </div>
      ),
    } as const;
    return [selectionCol, ...useTravelColumns(dateFormat), actionCol];
  }, [deleteEntry, duplicateEntry, dateFormat]);

  const selectedIds = useMemo(
    () => Object.entries(rowSelection).filter(([, v]) => v).map(([id]) => id),
    [rowSelection]
  );

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected entr${selectedIds.length === 1 ? "y" : "ies"}?`);
    if (!confirmed) return;
    await bulkDeleteTravelEntries(selectedIds);
    setRowSelection({});
  };

  const handleBulkDuplicate = async () => {
    if (!selectedIds.length) return;
    await bulkDuplicateTravelEntries(selectedIds);
    setRowSelection({});
  };

  const handleBulkPurpose = async () => {
    if (!selectedIds.length) return;
    const purpose = window.prompt("Set purpose for selected entries:");
    if (!purpose) return;
    await bulkUpdateTravelPurpose(selectedIds, purpose);
    setRowSelection({});
  };

  const handleBulkLocation = async () => {
    if (!selectedIds.length) return;
    const city = window.prompt("City (leave blank to only set country):", "");
    if (city === null) return;
    const country = window.prompt("Country:", "");
    if (!country) return;
    await bulkUpdateTravelLocation(selectedIds, city ?? "", country);
    setRowSelection({});
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-muted/50 p-4 rounded-lg border border-border/50 ui-text-body space-y-3">
        <h3 className="ui-text-heading font-semibold flex items-center gap-2">
          <span>ℹ️</span> IRCC Travel History Best Practices
        </h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-1">
           <li><strong>Be Accurate:</strong> List detailed trips outside your origin/residence from the last 10 years (or since age 18).</li>
           <li><strong>No Omissions:</strong> Include ALL trips, even short ones (layovers, day trips).</li>
           <li><strong>Match Passports:</strong> Dates must align exactly with your passport stamps.</li>
           <li><strong>No Overlaps:</strong> Travel history should not conflict with address history.</li>
           <li><strong>Gaps:</strong> Explain any gaps or missing documents in a Letter of Explanation.</li>
        </ul>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Travel History</h2>
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <Button variant="outline" onClick={handleBulkDelete}>
                  Delete
                </Button>
                <Button variant="outline" onClick={handleBulkDuplicate}>
                  Duplicate
                </Button>
                <Button variant="outline" onClick={handleBulkPurpose}>
                  Set Purpose
                </Button>
                <Button variant="outline" onClick={handleBulkLocation}>
                  Set City/Country
                </Button>
              </div>
            )}
            {process.env.NODE_ENV !== "production" && (
              <Button variant="secondary" onClick={() => addRandomTravelEntries(1)} className="gap-2">
                <Bug className="h-4 w-4" />
                <span className="sr-only">Add random</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
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

            <Button onClick={addEntry}>
              Add Entry
            </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <DataTable
            columns={columns}
            data={sortedData}
            onRowUpdate={handleRowUpdate}
            rowSelection={rowSelection}
            onRowSelectionChange={(updater) => {
              if (typeof updater === "function") {
                setRowSelection((prev) => updater(prev));
              } else {
                setRowSelection(updater);
              }
            }}
        />
      </div>

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
    </div>
  );
}
