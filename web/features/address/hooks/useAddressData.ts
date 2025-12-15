import { useLiveQuery } from "dexie-react-hooks";
import { db, AddressEntry } from "@/db/db";
import { nanoid } from "nanoid";
import { pushSnapshotFromDb } from "@/lib/historyManager";
import { useStore } from "@/store/useStore";

export async function addAddressEntry() {
  await pushSnapshotFromDb();
  const newEntry: AddressEntry = {
    id: nanoid(),
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    country: "",
    city: "",
    line1: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.address.add(newEntry);
  useStore.getState().markHighlightedRows([newEntry.id]);
}

export async function updateAddressEntry(id: string, updates: Partial<AddressEntry>) {
  await pushSnapshotFromDb();
  await db.address.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAddressEntry(id: string) {
  await pushSnapshotFromDb();
  await db.address.delete(id);
}

export async function duplicateAddressEntry(id: string) {
  const entry = await db.address.get(id);
  if (!entry) return;
  await pushSnapshotFromDb();
  const copy: AddressEntry = {
    ...entry,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.address.add(copy);
  useStore.getState().markHighlightedRows([copy.id]);
}

export async function deleteLastAddressEntry() {
  const last = await db.address.orderBy("startDate").last();
  if (!last) return;
  await pushSnapshotFromDb();
  await db.address.delete(last.id);
}

export async function duplicateLastAddressEntry() {
  const last = await db.address.orderBy("startDate").last();
  if (!last) return;
  await pushSnapshotFromDb();
  const copy: AddressEntry = {
    ...last,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.address.add(copy);
  useStore.getState().markHighlightedRows([copy.id]);
}

export function useAddressData() {
  const data = useLiveQuery(() => db.address.orderBy("startDate").toArray(), []);

  return {
    data: data ?? [],
    addEntry: addAddressEntry,
    updateEntry: updateAddressEntry,
    deleteEntry: deleteAddressEntry,
    duplicateEntry: duplicateAddressEntry,
    deleteLastEntry: deleteLastAddressEntry,
    duplicateLastEntry: duplicateLastAddressEntry,
  };
}
