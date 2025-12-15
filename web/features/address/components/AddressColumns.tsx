"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AddressEntry } from "@/db/db";
import { EditableCell } from "@/components/shared/EditableCell";
import { useAddressData } from "../hooks/useAddressData";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming shadcn checkbox exists or I'll use native input for now to avoid dependency check delay

// Helper to cast EditableCell as a compatible cell renderer type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cellRenderer = (props: any) => <EditableCell {...props} />;

// Custom cell for End Date to handle "Still living here"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EndDateCell = (props: any) => {
    const { getValue, row, column, table } = props;
    const value = getValue();
    const isCurrent = value === null;

    const handleCheck = (checked: boolean) => {
         if (checked) {
             table.options.meta?.updateData(row.index, column.id, null);
         } else {
             // Default to today if unchecking
             table.options.meta?.updateData(row.index, column.id, new Date().toISOString().split("T")[0]);
         }
    };

    if (isCurrent) {
        return (
            <div className="flex items-center gap-2 h-full px-2 text-muted-foreground italic">
                <span>Present</span>
                <Checkbox 
                    checked={true} 
                    onCheckedChange={(checked) => handleCheck(checked as boolean)}
                />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 w-full h-full">
            <EditableCell {...props} placeholder="YYYY-MM-DD" />
             <Checkbox 
                    checked={false} 
                    onCheckedChange={(checked) => handleCheck(checked as boolean)}
                    title="Still living here?"
                />
        </div>
    );
}


export const addressColumns: ColumnDef<AddressEntry>[] = [
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: cellRenderer,
    size: 170,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: EndDateCell,
    size: 170,
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: cellRenderer,
    size: 200,
  },
  {
    accessorKey: "city",
    header: "City",
    cell: cellRenderer,
    size: 200,
  },
  {
    accessorKey: "line1",
    header: "Address Line 1",
    cell: cellRenderer,
    size: 300,
  },
];
