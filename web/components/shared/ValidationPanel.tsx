"use client";

import {
  Blend,
  Ban,
  CheckCircle2,
  AlertTriangle,
  BetweenHorizontalStart,
  Pencil,
  NotebookText,
  MessageSquareDashed,
  ClockAlert,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDateDisplay } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { db } from "@/db/db";
import { nanoid } from "nanoid";
import { ValidationError } from "@/services/validator/validator";
import { pushSnapshotFromDb } from "@/lib/historyManager";

export function ValidationPanel() {
  const { validationErrors, isValidationOpen, setValidationOpen } = useStore();
  const dateFormat = useStore((s) => s.dateFormat);
  const setErrorHighlight = useStore((s) => s.setErrorHighlight);
  const setGapBorder = useStore((s) => s.setGapBorder);
  const errorCount = validationErrors.length;
  const hasErrors = validationErrors.some((error) => error.severity === "error");
  const hasWarnings = validationErrors.some((error) => error.severity === "warning");
  const hasIssues = errorCount > 0;
  const formatMessage = useMemo(() => {
    const isoRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
    return (msg: string) => msg.replace(isoRegex, (m) => formatDateDisplay(m, dateFormat));
  }, [dateFormat]);

  const handleFix = async (error: ValidationError) => {
    if (!error.fixAction) return;

    const { type } = error.fixAction;

    if (type === "FILL_GAP") {
        const { payload } = error.fixAction;
        await pushSnapshotFromDb();
        if (error.source === "travel") {
            await db.travel.add({
                id: nanoid(),
                startDate: payload.startDate,
                endDate: payload.endDate,
                destinationCountry: "",
                destinationCity: "",
                destination: "",
                purposeCode: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } else if (error.source === "address") {
            await db.address.add({
                id: nanoid(),
                startDate: payload.startDate,
                endDate: payload.endDate,
                country: "Select Country",
                city: "Select City",
                line1: "Enter Address",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    } else if (type === "DELETE_ROW") {
        await pushSnapshotFromDb();
        if (error.source === "travel") {
            await db.travel.delete(error.id);
        } else if (error.source === "address") {
            await db.address.delete(error.id);
        }
    }
  };

  return (
    <Sheet modal={false} open={isValidationOpen} onOpenChange={setValidationOpen}>
      <div className="fixed bottom-4 right-4 z-50">
           <SheetTrigger asChild>
            <Button 
                variant={hasErrors ? "destructive" : "outline"} 
                className={cn(
                  "rounded-full shadow-lg gap-2",
                  !hasErrors && hasWarnings
                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                    : ""
                )}
                size="lg"
            >
                {hasIssues ? (
                  <AlertTriangle className={cn("h-4 w-4", hasErrors ? "" : "text-amber-500")} />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {hasIssues ? `${errorCount} Issues` : "No Issues"}
            </Button>
            </SheetTrigger>
      </div>
     
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            Validation Report
            <Badge variant="outline">{errorCount}</Badge>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-6 h-[70vh]">
          {validationErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8">
              <CheckCircle2 className="h-12 w-12 text-green-500/20" />
              <p>Everything looks good!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validationErrors.map((error, idx) => (
                <div
                  key={`${error.id}-${idx}`}
                  className="flex gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent/50 transition-colors cursor-pointer group items-start"
                  onMouseEnter={() => {
                    if (error.type === "gap") {
                      setGapBorder({ id: error.id, severity: error.severity });
                      setErrorHighlight({ ids: [], severity: "error" });
                    } else {
                      const ids = [error.id, error.relatedId].filter(Boolean) as string[];
                      setErrorHighlight({ ids, severity: error.severity });
                      setGapBorder(null);
                    }
                  }}
                  onMouseLeave={() => {
                    setErrorHighlight({ ids: [], severity: "error" });
                    setGapBorder(null);
                  }}
                >
                  <div className="mt-1">
                    {error.type === "overlap" ? (
                      <Blend
                        className={cn(
                          "h-5 w-5",
                          error.severity === "warning" ? "text-amber-500" : "text-destructive"
                        )}
                      />
                    ) : error.type === "gap" ? (
                      <BetweenHorizontalStart
                        className={cn(
                          "h-5 w-5",
                          error.severity === "warning" ? "text-amber-500" : "text-destructive"
                        )}
                      />
                    ) : error.type === "too short" ? (
                      <Pencil className="h-5 w-5 text-amber-500" />
                    ) : error.type === "too long" ? (
                      <NotebookText className="h-5 w-5 text-amber-500" />
                    ) : error.type === "unfinished" ? (
                      <MessageSquareDashed className="h-5 w-5 text-destructive" />
                    ) : error.type === "long stay" ? (
                      <ClockAlert className="h-5 w-5 text-amber-500" />
                    ) : error.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Ban className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium ui-text-body capitalize">{error.type}</span>
                        <Badge variant="secondary" className="h-5 px-2 ui-text-label">{error.source}</Badge>
                    </div>
                    <p className="ui-text-body text-muted-foreground leading-relaxed">
                      {formatMessage(error.message)}
                    </p>
                    {error.fixAction && (
                        <Button 
                            size="sm"
                            variant="outline"
                            className="mt-2 ui-text-label bg-background hover:bg-accent hover:text-accent-foreground border-dashed"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFix(error);
                            }}
                        >
                            {error.fixAction.label}
                        </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
