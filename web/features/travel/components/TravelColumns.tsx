"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TravelEntry } from "@/db/db";
import { EditableCell } from "@/components/shared/EditableCell";
import { DateCell } from "@/components/shared/DateCell";
import { type DateFormat } from "@/lib/dateFormat";

export function buildTravelColumns(dateFormat: DateFormat): ColumnDef<TravelEntry>[] {
  return [
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: (props) => <DateCell {...props} format={dateFormat} className="whitespace-nowrap min-w-[110px]" />,
      size: 150,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: (props) => <DateCell {...props} format={dateFormat} className="whitespace-nowrap min-w-[110px]" />,
      size: 150,
    },
    {
      id: "duration",
      header: "Days",
      size: 90,
      meta: { className: "px-2 text-center" },
      cell: ({ row }) => {
          const start = row.original.startDate;
          const end = row.original.endDate;
          if (!start || !end) return "-";
          const toUtc = (val: string) => {
            const [y, m, d] = val.split("-").map(Number);
            return Date.UTC(y, (m || 1) - 1, d || 1);
          };
          const diff = toUtc(end) - toUtc(start);
          const days = Math.ceil(diff / (1000 * 3600 * 24));
          return days > 0 ? days : 0;
      }
    },
    {
      accessorKey: "destination",
      header: "City and Country",
      cell: (props) => (
        <EditableCell
          {...props}
          multiline
          className="whitespace-pre-wrap break-words text-wrap leading-5"
          placeholder="City, Country"
        />
      ),
      size: 260,
    },
    {
      accessorKey: "purposeCode",
      header: "Purpose",
      cell: (props) => (
        <EditableCell
          {...props}
          multiline
          className="whitespace-pre-wrap break-words text-wrap leading-5"
        />
      ),
      size: 180,
    },
  ];
}
