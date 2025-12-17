"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AddressEntry } from "@/db/db";
import { EditableCell } from "@/components/shared/EditableCell";
import { Checkbox } from "@/components/ui/checkbox";
import { DateCell } from "@/components/shared/DateCell";
import { type DateFormat } from "@/lib/dateFormat";
import { db } from "@/db/db";

type AddressCellContext = {
  getValue: () => unknown;
  row: { index: number; original: AddressEntry };
  column: { id: string };
  table: {
    options: {
      meta?: {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
      };
    };
  };
};

// Custom cell for End Date to handle "Still living here"
const EndDateCell = (props: AddressCellContext & { dateFormat: DateFormat }) => {
    const { getValue, row, column, table, dateFormat } = props;
    const value = getValue();
    const isCurrent = value === null;

    const handleCheck = async (checked: boolean) => {
         if (checked) {
             // Only the most recent address can be "Present"
             const latest = await db.address.orderBy("startDate").last();
             if (!latest || latest.id !== row.original.id) {
                alert("Only the most recent address can be marked as Present.");
                return;
             }
             // Close any other present entries
             const todayIso = new Date().toISOString().split("T")[0];
             await db.transaction("rw", db.address, async () => {
                await db.address
                  .filter((entry) => entry.endDate === null && entry.id !== latest.id)
                  .modify({ endDate: todayIso, updatedAt: new Date().toISOString() });
             });
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
            <DateCell {...props} format={dateFormat} placeholder="YYYY-MM-DD" />
             <Checkbox 
                    checked={false} 
                    onCheckedChange={(checked) => handleCheck(checked as boolean)}
                    title="Still living here?"
                />
        </div>
    );
}


export function buildAddressColumns(dateFormat: DateFormat): ColumnDef<AddressEntry>[] {
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
      cell: (props) => <EndDateCell {...props} dateFormat={dateFormat} />,
      size: 150,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: (props) => <EditableCell {...props} className="whitespace-normal break-words" />,
      size: 220,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: (props) => <EditableCell {...props} className="whitespace-normal break-words" />,
      size: 220,
    },
    {
      accessorKey: "line1",
      header: "Address Line 1",
      cell: (props) => <EditableCell {...props} className="whitespace-normal break-words" />,
      size: 300,
    },
  ];
}
