import { useLiveQuery } from "dexie-react-hooks";
import { db, TravelEntry } from "@/db/db";
import { nanoid } from "nanoid";
import { pushSnapshotFromDb } from "@/lib/historyManager";
import { useStore } from "@/store/useStore";

const sampleDestinations = [
  ["Paris", "France"],
  ["Toronto", "Canada"],
  ["New York", "USA"],
  ["Berlin", "Germany"],
  ["Tokyo", "Japan"],
  ["Sydney", "Australia"],
  ["Madrid", "Spain"],
  ["Rome", "Italy"],
  ["Dubai", "UAE"],
  ["Mexico City", "Mexico"],
  ["Seoul", "South Korea"],
  ["Singapore", "Singapore"],
  ["Bangkok", "Thailand"],
];

const samplePurposes = ["Tourism", "Work", "Family", "Study", "Transit", "Business"];

function randomDateRangeWithinYears(years = 10) {
  const now = new Date();
  const startBound = new Date();
  startBound.setFullYear(now.getFullYear() - years);

  const startTime = startBound.getTime();
  const endTime = now.getTime();
  const randomStart = new Date(startTime + Math.random() * (endTime - startTime));
  const durationDays = Math.max(1, Math.floor(Math.random() * 350) + 1);
  const randomEnd = new Date(randomStart);
  randomEnd.setDate(randomEnd.getDate() + durationDays - 1);

  const end = randomEnd > now ? now : randomEnd;

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: iso(randomStart), endDate: iso(end) };
}

export async function addTravelEntry() {
  await pushSnapshotFromDb();
  const newEntry: TravelEntry = {
    id: nanoid(),
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    destinationCountry: "",
    destinationCity: "",
    destination: "",
    purposeCode: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.travel.add(newEntry);
  useStore.getState().markHighlightedRows([newEntry.id]);
}

export async function updateTravelEntry(id: string, updates: Partial<TravelEntry>) {
  await pushSnapshotFromDb();
  await db.travel.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTravelEntry(id: string) {
  await pushSnapshotFromDb();
  await db.travel.delete(id);
}

export async function duplicateTravelEntry(id: string) {
  const entry = await db.travel.get(id);
  if (!entry) return;
  await pushSnapshotFromDb();
  const copy: TravelEntry = {
    ...entry,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.travel.add(copy);
  useStore.getState().markHighlightedRows([copy.id]);
}

export async function deleteLastTravelEntry() {
  const last = await db.travel.orderBy("startDate").last();
  if (!last) return;
  await pushSnapshotFromDb();
  await db.travel.delete(last.id);
}

export async function duplicateLastTravelEntry() {
  const last = await db.travel.orderBy("startDate").last();
  if (!last) return;
  await pushSnapshotFromDb();
  const copy: TravelEntry = {
    ...last,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.travel.add(copy);
  useStore.getState().markHighlightedRows([copy.id]);
}

export async function addRandomTravelEntries(count = 100) {
  await pushSnapshotFromDb();
  const nowIso = new Date().toISOString();

  const entries: TravelEntry[] = Array.from({ length: count }).map(() => {
    const { startDate, endDate } = randomDateRangeWithinYears(10);
    const [city, country] = sampleDestinations[Math.floor(Math.random() * sampleDestinations.length)];
    const purpose = samplePurposes[Math.floor(Math.random() * samplePurposes.length)];

    return {
      id: nanoid(),
      startDate,
      endDate,
      destination: `${city}, ${country}`,
      destinationCity: city,
      destinationCountry: country,
      purposeCode: purpose,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  });

  await db.travel.bulkAdd(entries);
  useStore.getState().markHighlightedRows(entries.map((e) => e.id));
}

export function useTravelData() {
  const data = useLiveQuery(() => db.travel.orderBy("startDate").toArray(), []);

  return {
    data: data ?? [],
    addEntry: addTravelEntry,
    updateEntry: updateTravelEntry,
    deleteEntry: deleteTravelEntry,
    duplicateEntry: duplicateTravelEntry,
    deleteLastEntry: deleteLastTravelEntry,
    duplicateLastEntry: duplicateLastTravelEntry,
  };
}
