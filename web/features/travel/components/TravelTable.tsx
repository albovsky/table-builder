"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useTravelData, bulkDeleteTravelEntries, bulkDuplicateTravelEntries, bulkUpdateTravelPurpose, bulkUpdateTravelLocation } from "../hooks/useTravelData";
import { buildTravelColumns } from "./TravelColumns";
import { TravelEntry } from "@/db/db";
import { Copy, Bug, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { addRandomTravelEntries } from "../hooks/useTravelData";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { useStore } from "@/store/useStore";

export function TravelTable() {
  const { data, updateEntry, addEntry, deleteEntry, duplicateEntry } = useTravelData();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const dateFormat = useStore((s) => s.dateFormat);

  const handleRowUpdate = (rowIndex: number, columnId: string, value: unknown) => {
    const row = data[rowIndex];
    if (!row) return;
    updateEntry(row.id, { [columnId]: value });
  };

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
      size: 36,
      meta: { className: "px-2 text-center" },
      enableSorting: false,
      enableHiding: false,
    };

    const actionCol = {
      id: "actions",
      header: "",
      size: 80,
      meta: { className: "px-1" },
      cell: ({ row }: { row: { original: TravelEntry } }) => (
        <div className="w-full flex items-center justify-end gap-2 pr-1">
          <Button
            size="icon"
            variant="outline"
            className="size-10 min-w-[40px] min-h-[40px] p-0 aspect-square"
            onClick={() => duplicateEntry(row.original.id)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-10 min-w-[40px] min-h-[40px] p-0 aspect-square"
            onClick={() => deleteEntry(row.original.id)}
            title="Delete"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
    } as const;
    return [selectionCol, ...buildTravelColumns(dateFormat), actionCol];
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
    </div>
  );
}
