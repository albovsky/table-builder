"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  exportType: "PDF" | "CSV" | "Clipboard";
}

export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  exportType,
}: ExportDialogProps) {
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsExporting(false);
      return;
    }

    // Clipboard already executed in table component before dialog opened
    // Only PDF/CSV need to execute after animation
    setIsExporting(true);
    
    // Animate the progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Execute delayed exports (PDF/CSV) after animation
          // Skip clipboard since it already executed
          if (exportType !== "Clipboard") {
            onExport();
          }
          setIsExporting(false);
          return 100;
        }
        return prev + (100 / 20); // 20 frames over 2 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onExport, exportType]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExporting ? `Preparing ${exportType}...` : "Export Complete!"}
          </DialogTitle>
          <DialogDescription>
            {isExporting
              ? "Please wait while we prepare your export."
              : "Your export has been generated successfully."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Progress value={progress} className="w-full" />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3 ui-text-body">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-6 w-6 fill-current" />
              <span className="font-semibold">Support Table Builder</span>
            </div>
            <p className="text-muted-foreground">
              This tool is completely free and open source. If it helped you
              save time, please consider supporting development and server
              costs!
            </p>
            <div className="flex gap-2">
              <Button asChild className="w-full">
                <a
                  href="https://buymeacoffee.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Donate
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
