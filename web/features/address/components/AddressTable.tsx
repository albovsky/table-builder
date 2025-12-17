"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useState } from "react";
import { useAddressData, bulkDeleteAddressEntries, bulkDuplicateAddressEntries, bulkUpdateAddressLocation } from "../hooks/useAddressData";
import { buildAddressColumns } from "./AddressColumns";
import { Button } from "@/components/ui/button";
import { AddressEntry } from "@/db/db";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { useStore } from "@/store/useStore";

export function AddressTable() {
  const { data, updateEntry, addEntry, deleteEntry, duplicateEntry } = useAddressData();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const dateFormat = useStore((s) => s.dateFormat);

  const handleRowUpdate = (rowIndex: number, columnId: string, value: unknown) => {
    const row = data[rowIndex];
    if (!row) return;

    updateEntry(row.id, { [columnId]: value });
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
      size: 36,
      meta: { className: "px-2 text-center" },
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
