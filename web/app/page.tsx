"use client";

import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelTable } from "@/features/travel/components/TravelTable";
import { AddressTable } from "@/features/address/components/AddressTable";
import { ValidationPanel } from "@/components/shared/ValidationPanel";
import { DebugPanel } from "@/components/shared/DebugPanel";
import { useStore } from "@/store/useStore";
import { useValidationWorker } from "@/hooks/useValidationWorker";
import { undoSnapshot, redoSnapshot } from "@/lib/historyManager";
import {
  addTravelEntry,
  deleteLastTravelEntry,
  duplicateLastTravelEntry,
} from "@/features/travel/hooks/useTravelData";
import {
  addAddressEntry,
  deleteLastAddressEntry,
  duplicateLastAddressEntry,
} from "@/features/address/hooks/useAddressData";

const isTypingField = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
};

export default function Home() {
  const { workMode, setWorkMode, setValidationOpen } = useStore();
  
  // Start the validation worker
  useValidationWorker();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;
      if (isTypingField(event.target)) return;

      const key = event.key.toLowerCase();

      // Undo / Redo
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoSnapshot();
        return;
      }
      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redoSnapshot();
        return;
      }

      // Add / delete / duplicate row in active tab
      if (key === "n" && event.shiftKey) {
        event.preventDefault();
        workMode === "travel" ? addTravelEntry() : addAddressEntry();
        return;
      }

      if (key === "backspace") {
        event.preventDefault();
        workMode === "travel" ? deleteLastTravelEntry() : deleteLastAddressEntry();
        return;
      }

      if (key === "d") {
        event.preventDefault();
        workMode === "travel" ? duplicateLastTravelEntry() : duplicateLastAddressEntry();
        return;
      }

      // Switch tabs
      if (key === "[") {
        event.preventDefault();
        setWorkMode("travel");
        return;
      }

      if (key === "]") {
        event.preventDefault();
        setWorkMode("address");
        return;
      }

      // Open validation panel
      if (key === "v" && event.shiftKey) {
        event.preventDefault();
        setValidationOpen(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [workMode, setWorkMode, setValidationOpen]);

  return (
    <div className="flex flex-col items-center space-y-6 w-full pt-6 md:pt-10">
      <Tabs 
        value={workMode} 
        onValueChange={(value) => setWorkMode(value as "travel" | "address")} 
        className="w-[400px]"
      >
        <div className="flex justify-center">
            <TabsList className="bg-background gap-1 border p-1">
            <TabsTrigger 
              value="travel"
              className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
            >
              Travel History
            </TabsTrigger>
            <TabsTrigger 
              value="address"
              className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
            >
              Address History
            </TabsTrigger>
            </TabsList>
        </div>
      </Tabs>
      
      <div className="w-full flex-1 px-6">
        {workMode === "travel" ? <TravelTable /> : <AddressTable />}
      </div>
      <ValidationPanel />
      {process.env.NODE_ENV !== "production" && <DebugPanel />}
    </div>
  );
}
