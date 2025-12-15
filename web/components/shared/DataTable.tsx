"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowUpdate?: (rowIndex: number, columnId: string, value: unknown) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowUpdate,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const { highlightedRows } = useStore();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange as any,
    getRowId: (row, idx) => (row as any).id ?? String(idx),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        onRowUpdate?.(rowIndex, columnId, value);
      },
    },
  });

  const { rows } = table.getRowModel();

  return (
    <div className="w-full rounded-md border border-border bg-card">
      <table className="w-full ui-text-body text-left border-collapse">
        <thead className="bg-muted/50 text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="ui-table-header ui-table-cell font-semibold select-none border-b border-border/50 text-left"
                  style={header.getSize() ? { width: header.getSize() } : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={cn(
                "ui-table-row border-b border-border/40 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
                highlightedRows[(row.original as { id?: string }).id ?? ""] ? "row-highlight" : ""
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="ui-table-cell h-full align-middle"
                  style={cell.column.getSize() ? { width: cell.column.getSize() } : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
