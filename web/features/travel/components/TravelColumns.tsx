"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TravelEntry } from "@/db/db";
import { EditableCell } from "@/components/shared/EditableCell";

// Helper to cast EditableCell as a compatible cell renderer type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cellRenderer = (props: any) => <EditableCell {...props} />;

export const travelColumns: ColumnDef<TravelEntry>[] = [
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: cellRenderer,
    size: 170,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: cellRenderer,
    size: 170,
  },
  {
    id: "duration",
    header: "Amount of Days",
    size: 120,
    cell: ({ row }) => {
        const start = row.original.startDate;
        const end = row.original.endDate;
        if (!start || !end) return "-";
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    }
  },
  {
    accessorKey: "destination",
    header: "City and Country",
    cell: cellRenderer,
    size: 300,
  },
  {
    accessorKey: "purposeCode",
    header: "Purpose",
    cell: cellRenderer,
    size: 150,
  },
];
