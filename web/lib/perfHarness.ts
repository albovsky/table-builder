import { db, type TravelEntry } from "@/db/db";
import { nanoid } from "nanoid";
import { generateTravelEntries } from "./generateDataset";
import { addTravelEntry, duplicateTravelEntry, deleteTravelEntry } from "@/features/travel/hooks/useTravelData";
import { useStore } from "@/store/useStore";

export interface BenchmarkResult {
  seedMs: number;
  addMs: number;
  duplicateMs: number;
  deleteMs: number;
  renderMs: number;
  total: number;
  count: number;
}

export type BenchmarkMode = "db" | "ui";

const now = () => (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now());

export async function runTravelBenchmark(count = 2000): Promise<BenchmarkResult> {
  return runTravelBenchmarkWithOptions({ count, mode: "db", useTransaction: true });
}

export async function runTravelBenchmarkWithOptions({
  count = 2000,
  mode = "db",
  useTransaction = true,
}: {
  count?: number;
  mode?: BenchmarkMode;
  useTransaction?: boolean;
}): Promise<BenchmarkResult> {
  const result: BenchmarkResult = {
    seedMs: 0,
    addMs: 0,
    duplicateMs: 0,
    deleteMs: 0,
    renderMs: 0,
    total: 0,
    count,
  };

  const startSeed = now();
  await db.travel.clear();
  const seedData = generateTravelEntries(count);
  if (useTransaction) {
    await db.transaction("rw", db.travel, async () => {
      await db.travel.bulkAdd(seedData);
    });
  } else {
    await db.travel.bulkAdd(seedData);
  }
  result.seedMs = now() - startSeed;

  const addStart = now();
  if (mode === "ui") {
    // Temporarily enable perfMode to skip snapshots in UI path
    const prevPerf = useStore.getState().perfMode;
    useStore.getState().setPerfMode(true);
    await addTravelEntry();
    useStore.getState().setPerfMode(prevPerf);
  } else {
    const newEntry: TravelEntry = {
      id: nanoid(),
      startDate: "2024-01-01",
      endDate: "2024-01-10",
      destination: "Benchmark City, Benchmarkland",
      destinationCity: "Benchmark City",
      destinationCountry: "Benchmarkland",
      purposeCode: "Test",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (useTransaction) {
      await db.transaction("rw", db.travel, async () => {
        await db.travel.bulkAdd([newEntry]);
      });
    } else {
      await db.travel.bulkAdd([newEntry]);
    }
  }
  result.addMs = now() - addStart;

  const dupStart = now();
  const source = seedData[count - 1];
  if (source) {
    if (mode === "ui") {
      const prevPerf = useStore.getState().perfMode;
      useStore.getState().setPerfMode(true);
      await duplicateTravelEntry(source.id);
      useStore.getState().setPerfMode(prevPerf);
    } else {
      const copy: TravelEntry = {
        ...source,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (useTransaction) {
        await db.transaction("rw", db.travel, async () => {
          await db.travel.bulkAdd([copy]);
        });
      } else {
        await db.travel.bulkAdd([copy]);
      }
    }
  }
  result.duplicateMs = now() - dupStart;

  const delStart = now();
  const toDelete = seedData[0]?.id;
  if (toDelete) {
    if (mode === "ui") {
      const prevPerf = useStore.getState().perfMode;
      useStore.getState().setPerfMode(true);
      await deleteTravelEntry(toDelete);
      useStore.getState().setPerfMode(prevPerf);
    } else {
      if (useTransaction) {
        await db.transaction("rw", db.travel, async () => {
          await db.travel.bulkDelete([toDelete]);
        });
      } else {
        await db.travel.bulkDelete([toDelete]);
      }
    }
  }
  result.deleteMs = now() - delStart;

  const renderStart = now();
  // Simulate render cost by materializing data; actual UI render depends on React
  await db.travel.toArray();
  result.renderMs = now() - renderStart;

  result.total = result.seedMs + result.addMs + result.duplicateMs + result.deleteMs + result.renderMs;
  return result;
}
