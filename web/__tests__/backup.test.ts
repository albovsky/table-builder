import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/db/db";
import { generateTravelEntries } from "@/lib/generateDataset";
import {
  createBackup,
  restoreBackup,
  listBackups,
  MAX_BACKUPS,
} from "@/lib/backupManager";

describe("Backup manager", () => {
  beforeEach(async () => {
    await db.travel.clear();
    await db.address.clear();
    await db.profile.clear();
    await db.backups.clear();
  });

  it("creates a backup and restores it", async () => {
    const entries = generateTravelEntries(1);
    await db.travel.bulkAdd(entries);

    const backup = await createBackup();
    expect(backup.id).toBeDefined();

    await db.travel.clear();
    expect(await db.travel.count()).toBe(0);

    await restoreBackup();
    const count = await db.travel.count();
    expect(count).toBe(1);
    const restored = await db.travel.get(entries[0].id);
    expect(restored?.destinationCountry).toBe(entries[0].destinationCountry);
  });

  it("prunes backups beyond the limit", async () => {
    const entries = generateTravelEntries(2);
    await db.travel.bulkAdd(entries);

    // Create more backups than allowed.
    for (let i = 0; i < MAX_BACKUPS + 3; i++) {
      await createBackup();
    }

    const backups = await listBackups();
    expect(backups.length).toBeLessThanOrEqual(MAX_BACKUPS);
  });
});
