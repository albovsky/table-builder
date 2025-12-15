"use client";

import { Blend, Ban, CheckCircle2, AlertTriangle, BetweenHorizontalStart } from "lucide-react";
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
import { useMemo } from "react";

import { db } from "@/db/db";
import { nanoid } from "nanoid";
import { ValidationError } from "@/services/validator/validator";
import { pushSnapshotFromDb } from "@/lib/historyManager";

export function ValidationPanel() {
  const { validationErrors, isValidationOpen, setValidationOpen } = useStore();
  const dateFormat = useStore((s) => s.dateFormat);
  const setErrorHighlightIds = useStore((s) => s.setErrorHighlightIds);
  const setGapBorderId = useStore((s) => s.setGapBorderId);
  const errorCount = validationErrors.length;
  const hasErrors = errorCount > 0;
  const formatMessage = useMemo(() => {
    const isoRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
    return (msg: string) => msg.replace(isoRegex, (m) => formatDateDisplay(m, dateFormat));
  }, [dateFormat]);

  const handleFix = async (error: ValidationError) => {
    if (!error.fixAction) return;

    const { type, payload } = error.fixAction;

    if (type === "FILL_GAP") {
        await pushSnapshotFromDb();
        if (error.source === "travel") {
            await db.travel.add({
                id: nanoid(),
                startDate: payload.startDate,
                endDate: payload.endDate,
                destinationCountry: "Home",
                destinationCity: "",
                destination: "Home",
                purposeCode: "Personal",
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
    }
  };

  return (
    <Sheet modal={false} open={isValidationOpen} onOpenChange={setValidationOpen}>
      <div className="fixed bottom-4 right-4 z-50">
           <SheetTrigger asChild>
            <Button 
                variant={hasErrors ? "destructive" : "outline"} 
                className="rounded-full shadow-lg gap-2"
                size="lg"
            >
                {hasErrors ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {hasErrors ? `${errorCount} Issues` : "No Issues"}
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
                      setGapBorderId(error.id);
                      setErrorHighlightIds([]);
                    } else {
                      const ids = [error.id, error.relatedId].filter(Boolean) as string[];
                      setErrorHighlightIds(ids);
                      setGapBorderId(null);
                    }
                  }}
                  onMouseLeave={() => {
                    setErrorHighlightIds([]);
                    setGapBorderId(null);
                  }}
                >
                  <div className="mt-1">
                    {error.type === "overlap" ? (
                      <Blend className="h-5 w-5 text-destructive" />
                    ) : error.type === "gap" ? (
                      <BetweenHorizontalStart className="h-5 w-5 text-destructive" />
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
