"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useState } from "react";
import { useAddressData, bulkDeleteAddressEntries, bulkDuplicateAddressEntries, bulkUpdateAddressLocation } from "../hooks/useAddressData";
import { buildAddressColumns } from "./AddressColumns";
import { FileDown, FileText, Copy, Check, ChevronDown } from "lucide-react";
import { exportAddressCSV, downloadCSV, copyAddressToClipboard } from "@/services/export/csvExporter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/shared/ExportDialog";
import { AddressEntry } from "@/db/db";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { useStore } from "@/store/useStore";

export function AddressTable() {
  const { data, updateEntry, addEntry, deleteEntry, duplicateEntry } = useAddressData();
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

  const handleCopy = async () => {
      await copyAddressToClipboard(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const handleCSV = () => {
      const csv = exportAddressCSV(data);
      downloadCSV(csv, `address_history_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePDF = async () => {
    const mod = await import("@/services/export/pdfExporter");
    mod.exportAddressPDF(data);
  };

  const columns = useMemo<ColumnDef<AddressEntry>[]>(() => {
    const selectionCol: ColumnDef<AddressEntry> = {
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
      cell: ({ row }: { row: { original: AddressEntry } }) => (
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
    return [selectionCol, ...buildAddressColumns(dateFormat), actionCol];
  }, [deleteEntry, duplicateEntry, dateFormat]);

  const selectedIds = useMemo(
    () => Object.entries(rowSelection).filter(([, v]) => v).map(([id]) => id),
    [rowSelection]
  );

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected entr${selectedIds.length === 1 ? "y" : "ies"}?`);
    if (!confirmed) return;
    await bulkDeleteAddressEntries(selectedIds);
    setRowSelection({});
  };

  const handleBulkDuplicate = async () => {
    if (!selectedIds.length) return;
    await bulkDuplicateAddressEntries(selectedIds);
    setRowSelection({});
  };

  const handleBulkLocation = async () => {
    if (!selectedIds.length) return;
    const city = window.prompt("City (leave blank to only set country):", "");
    if (city === null) return;
    const country = window.prompt("Country:", "");
    if (!country) return;
    await bulkUpdateAddressLocation(selectedIds, city ?? "", country);
    setRowSelection({});
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Address History</h2>
        <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <Button variant="outline" onClick={handleBulkDelete}>
                  Delete
                </Button>
                <Button variant="outline" onClick={handleBulkDuplicate}>
                  Duplicate
                </Button>
                <Button variant="outline" onClick={handleBulkLocation}>
                  Set City/Country
                </Button>
              </div>
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
          data={data}
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
