"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps extends React.InputHTMLAttributes<HTMLInputElement> {
  getValue: () => unknown;
  row: { index: number };
  column: { id: string };
  table: {
    options: {
      meta?: {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void;
      };
    };
  };
}

export function EditableCell({
  getValue,
  row,
  column,
  table,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cell,
  ...props
}: EditableCellProps & { renderValue?: unknown; cell?: unknown }) {
  const initialValue = getValue();
  const [value, setValue] = React.useState(initialValue);
  const [isEditing, setIsEditing] = React.useState(false);

  // Sync internal state if external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    setIsEditing(false);
    table.options.meta?.updateData(row.index, column.id, value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        e.currentTarget.blur();
    }
  };

  return (
    <div className={cn("relative w-full h-full min-h-[var(--table-row-height)] flex items-center", className)}>
        <input
            {...props}
            value={(value ?? "") as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="w-full h-full px-2 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded-sm placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/20 ui-text-body"
            placeholder={props.placeholder || "Empty"}
        />
    </div>
  );
}
