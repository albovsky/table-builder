"use client";
/** @noReactCompiler */
"use client";

import {
  createTable,
  getCoreRowModel,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type TableOptionsResolved,
  type Table,
  type TableOptions,
  type TableState,
} from "@tanstack/table-core";
import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

interface DataTableProps<TData extends { id?: string }> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  onRowUpdate?: (rowIndex: number, columnId: string, value: unknown) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

function useTableInstance<TData extends { id?: string }>(
  options: TableOptions<TData>
): Table<TData> {
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        options.meta?.updateData?.(rowIndex, columnId, value);
      },
    },
  };

  const [table] = React.useState(() => {
    const t = createTable(resolvedOptions);
    const seedState = { ...t.initialState, ...options.state };
    t.setOptions((prev) => ({
      ...prev,
      state: seedState,
      onStateChange: options.onStateChange ?? (() => {}),
    }));
    return t;
  });

  const [state, setState] = React.useState<TableState>(() => ({
    ...table.initialState,
    ...options.state,
  }));

  React.useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      ...options,
      state: {
        ...state,
        ...options.state,
      },
      onStateChange: (updater) => {
        setState(updater as TableState);
        options.onStateChange?.(updater);
      },
    }));
  }, [options, state, table]);

  return table;
}

export function DataTable<TData extends { id?: string }>({
  columns,
  data,
  onRowUpdate,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const { highlightedRows, errorHighlight, gapBorder } = useStore();
  const rowNumberColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
      id: "__rowNumber",
      header: "#",
      size: 44,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => row.index + 1,
      meta: { className: "text-center text-muted-foreground px-2 w-[44px]" },
    }),
    []
  );

  const columnsWithNumbers = React.useMemo(() => {
    if (!columns || columns.length === 0) return [rowNumberColumn];
    if (columns[0]?.id === "select") {
      return [columns[0], rowNumberColumn, ...columns.slice(1)];
    }
    return [rowNumberColumn, ...columns];
  }, [columns, rowNumberColumn]);

  const table = useTableInstance({
    data,
    columns: columnsWithNumbers,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange,
    getRowId: (row, idx) => row.id ?? String(idx),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        onRowUpdate?.(rowIndex, columnId, value);
      },
    },
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 56,
    overscan: 8,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 56,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1].end)
      : 0;

  return (
    <div className="w-full rounded-md border border-border bg-card overflow-hidden">
      <table className="w-full ui-text-body text-left border-collapse">
        <thead className="bg-muted/50 text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "ui-table-header ui-table-cell font-semibold select-none border-b border-border/50 text-left",
                    (header.column.columnDef.meta as { className?: string } | undefined)?.className
                  )}
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
          {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }} aria-hidden="true" />}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const rowId = (row.original as { id?: string }).id ?? "";
            const isGapBorder = gapBorder?.id === rowId;
            const isWarningHighlight =
              errorHighlight.severity === "warning" && errorHighlight.ids.includes(rowId);
            const isErrorHighlight =
              errorHighlight.severity === "error" && errorHighlight.ids.includes(rowId);
            const gapBorderStyle =
              isGapBorder && gapBorder?.severity === "warning"
                ? {
                    backgroundImage:
                      "linear-gradient(to right, transparent, rgba(245,158,11,0.45) 8%, rgba(245,158,11,0.7) 50%, rgba(245,158,11,0.45) 92%, transparent)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 2px",
                    backgroundPosition: "0 calc(100% - 0.5px)",
                    boxShadow: "0 0 10px rgba(245,158,11,0.22)",
                  }
                : isGapBorder
                  ? {
                      backgroundImage:
                        "linear-gradient(to right, transparent, rgba(239,68,68,0.45) 8%, rgba(239,68,68,0.7) 50%, rgba(239,68,68,0.45) 92%, transparent)",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "100% 2px",
                      backgroundPosition: "0 calc(100% - 0.5px)",
                      boxShadow: "0 0 10px rgba(239,68,68,0.22)",
                    }
                  : {};
            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                data-state={row.getIsSelected() ? "selected" : undefined}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "ui-table-row border-b border-border/40 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
                  highlightedRows[rowId] ? "row-highlight" : "",
                  isErrorHighlight ? "bg-destructive/10" : "",
                  isWarningHighlight ? "bg-amber-100/70 dark:bg-amber-900/20" : "",
                  isGapBorder ? "relative overflow-hidden border-b border-transparent" : ""
                )}
                style={{
                  ...gapBorderStyle,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "ui-table-cell h-full align-middle",
                    (cell.column.columnDef.meta as { className?: string } | undefined)?.className
                  )}
                  style={cell.column.getSize() ? { width: cell.column.getSize() } : undefined}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }} aria-hidden="true" />}
        </tbody>
      </table>
    </div>
  );
}
