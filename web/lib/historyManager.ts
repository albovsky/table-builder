import { db, TravelEntry, AddressEntry } from "@/db/db";
import { useStore, type HistorySnapshot } from "@/store/useStore";

const MAX_ITEMS = 50;

export async function captureSnapshot(): Promise<HistorySnapshot> {
  const [travel, address] = await Promise.all([
    db.travel.orderBy("startDate").toArray(),
    db.address.orderBy("startDate").toArray(),
  ]);

  return {
    travel,
    address,
    timestamp: Date.now(),
  };
}

export async function applySnapshot(snapshot: HistorySnapshot) {
  await db.transaction("rw", db.travel, db.address, async () => {
    await db.travel.clear();
    await db.address.clear();
    if (snapshot.travel.length) {
      await db.travel.bulkAdd(snapshot.travel as TravelEntry[]);
    }
    if (snapshot.address.length) {
      await db.address.bulkAdd(snapshot.address as AddressEntry[]);
    }
  });
}

export async function pushSnapshotFromDb() {
  const snapshot = await captureSnapshot();
  useStore.getState().pushSnapshot(snapshot);
}

export async function undoSnapshot() {
  const state = useStore.getState();
  const target = state.shiftUndo();
  if (!target) return false;

  const current = await captureSnapshot();
  await applySnapshot(target);
  state.pushRedo(current);
  return true;
}

export async function redoSnapshot() {
  const state = useStore.getState();
  const target = state.shiftRedo();
  if (!target) return false;

  const current = await captureSnapshot();
  await applySnapshot(target);
  useStore.setState((prev) => ({
    undoStack: [...prev.undoStack, current].slice(-MAX_ITEMS),
  }));
  return true;
}

// Utility to truncate stacks if we manually modify them elsewhere (future use)
export function trimHistoryStacks() {
  const { undoStack, redoStack } = useStore.getState();
  useStore.setState({
    undoStack: undoStack.slice(-MAX_ITEMS),
    redoStack: redoStack.slice(-MAX_ITEMS),
  });
}
