import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ValidationError } from "@/services/validator/validator";
import { TravelEntry, AddressEntry } from "@/db/db";
import { type RowSelectionState } from "@tanstack/react-table";

export interface HistorySnapshot {
  travel: TravelEntry[];
  address: AddressEntry[];
  timestamp: number;
}

interface AppState {
  workMode: "travel" | "address";
  setWorkMode: (mode: "travel" | "address") => void;
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;
  isValidationOpen: boolean;
  setValidationOpen: (open: boolean) => void;
  layoutMode: "centered" | "wide";
  setLayoutMode: (mode: "centered" | "wide") => void;
  dateFormat: "iso" | "mdy" | "dmy" | "mdy-mon" | "dmy-mon";
  setDateFormat: (fmt: "iso" | "mdy" | "dmy" | "mdy-mon" | "dmy-mon") => void;
  highlightedRows: Record<string, boolean>;
  markHighlightedRows: (ids: string[]) => void;
  travelSelection: RowSelectionState;
  addressSelection: RowSelectionState;
  setTravelSelection: (sel: RowSelectionState) => void;
  setAddressSelection: (sel: RowSelectionState) => void;
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  pushSnapshot: (snapshot: HistorySnapshot) => void;
  shiftUndo: () => HistorySnapshot | null;
  shiftRedo: () => HistorySnapshot | null;
  pushRedo: (snapshot: HistorySnapshot) => void;
  clearRedo: () => void;
}

const MAX_HISTORY = 50;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      workMode: "travel",
      setWorkMode: (mode) => set({ workMode: mode }),
      validationErrors: [],
      setValidationErrors: (errors) => set({ validationErrors: errors }),
      isValidationOpen: false,
      setValidationOpen: (open) => set({ isValidationOpen: open }),
      layoutMode: "centered",
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      dateFormat: "iso",
      setDateFormat: (fmt) => set({ dateFormat: fmt }),
      highlightedRows: {},
      travelSelection: {},
      addressSelection: {},
      setTravelSelection: (sel) => set({ travelSelection: sel }),
      setAddressSelection: (sel) => set({ addressSelection: sel }),
      markHighlightedRows: (ids) => {
        if (!ids.length) return;
        set((state) => {
          const next = { ...state.highlightedRows };
          ids.forEach((id) => {
            next[id] = true;
            setTimeout(() => {
              useStore.setState((current) => {
                const updated = { ...current.highlightedRows };
                delete updated[id];
                return { highlightedRows: updated };
              });
            }, 2000);
          });
          return { highlightedRows: next };
        });
      },
      undoStack: [],
      redoStack: [],
      pushSnapshot: (snapshot) =>
        set((state) => ({
          undoStack: [...state.undoStack, snapshot].slice(-MAX_HISTORY),
          redoStack: [],
        })),
      shiftUndo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return null;
        const target = undoStack[undoStack.length - 1];
        set({ undoStack: undoStack.slice(0, -1) });
        return target;
      },
      shiftRedo: () => {
        const { redoStack } = get();
        if (redoStack.length === 0) return null;
        const target = redoStack[redoStack.length - 1];
        set({ redoStack: redoStack.slice(0, -1) });
        return target;
      },
      pushRedo: (snapshot) =>
        set((state) => ({
          redoStack: [...state.redoStack, snapshot].slice(-MAX_HISTORY),
        })),
      clearRedo: () => set({ redoStack: [] }),
    }),
    {
      name: "table-builder-settings",
      partialize: (state) => ({
        layoutMode: state.layoutMode,
        dateFormat: state.dateFormat,
      }),
    }
  )
);
