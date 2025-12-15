import * as React from "react";
import { cn } from "@/lib/utils";
import { formatDateDisplay, parseDateDisplay, type DateFormat } from "@/lib/dateFormat";

interface DateCellProps {
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
  className?: string;
  format: DateFormat;
  placeholder?: string;
}

export function DateCell({
  getValue,
  row,
  column,
  table,
  className,
  format,
  placeholder = "YYYY-MM-DD",
}: DateCellProps) {
  const rawValue = getValue() as string | null | undefined;
  const [text, setText] = React.useState(formatDateDisplay(rawValue ?? "", format));

  React.useEffect(() => {
    setText(formatDateDisplay(rawValue ?? "", format));
  }, [rawValue, format]);

  const onBlur = () => {
    const iso = parseDateDisplay(text, format);
    if (iso === null) {
      // invalid; reset to formatted current value
      setText(formatDateDisplay(rawValue ?? "", format));
      return;
    }
    table.options.meta?.updateData(row.index, column.id, iso);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        e.currentTarget.blur();
    }
  };

  return (
    <div className={cn("relative w-full h-full min-h-[var(--table-row-height)] flex items-center", className)}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full h-full px-2 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded-sm placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/20 ui-text-body"
        placeholder={placeholder}
        inputMode="text"
      />
    </div>
  );
}
