"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { memo } from "react";

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
  multiline?: boolean;
}

function EditableCellComponent({
  getValue,
  row,
  column,
  table,
  className,
  multiline,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cell,
  ...props
}: EditableCellProps & { renderValue?: unknown; cell?: unknown }) {
  const initialValue = getValue();
  const [value, setValue] = React.useState(initialValue);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Sync internal state if external data changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
        e.currentTarget.blur();
    }
  };

  React.useEffect(() => {
    if (multiline && textAreaRef.current) {
      const el = textAreaRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [multiline, value]);

  return (
    <div
      className={cn(
        "relative w-full h-full",
        multiline ? "flex items-stretch" : "min-h-[var(--table-row-height)] flex items-center",
        className
      )}
    >
      {multiline ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          value={(value ?? "") as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          ref={textAreaRef}
          rows={1}
          className="w-full h-full px-2 py-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded-sm placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/20 ui-text-body resize-none leading-5 whitespace-pre-wrap break-words text-wrap"
          placeholder={props.placeholder || "Empty"}
        />
      ) : (
        <input
          {...props}
          value={(value ?? "") as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="w-full h-full px-2 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded-sm placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/20 ui-text-body"
          placeholder={props.placeholder || "Empty"}
        />
      )}
    </div>
  );
}

export const EditableCell = memo(EditableCellComponent);
