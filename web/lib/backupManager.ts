import { db, type BackupRecord } from "@/db/db";
import { useStore } from "@/store/useStore";
import { applySnapshot, captureSnapshot } from "@/lib/historyManager";

export const BACKUP_VERSION = 1;
export const MAX_BACKUPS = 10;

export async function createBackup(): Promise<BackupRecord> {
  const snapshot = await captureSnapshot();
  const record: BackupRecord = {
    version: BACKUP_VERSION,
    createdAt: Date.now(),
    snapshot,
  };

  const id = await db.backups.add(record);
  await pruneBackups();
  return { ...record, id };
}

export async function listBackups(): Promise<BackupRecord[]> {
  return db.backups.orderBy("createdAt").reverse().toArray();
}

export async function getLatestBackup(): Promise<BackupRecord | undefined> {
  return db.backups.orderBy("createdAt").last();
}

export async function restoreBackup(id?: number): Promise<BackupRecord> {
  const backup = id
    ? await db.backups.get(id)
    : await getLatestBackup();

  if (!backup) {
    throw new Error("No backups available to restore.");
  }

  if (backup.version !== BACKUP_VERSION) {
    throw new Error(`Backup version mismatch (found v${backup.version}, expected v${BACKUP_VERSION}).`);
  }

  // Capture current state so user can undo a restore if needed.
  const current = await captureSnapshot();
  await applySnapshot(backup.snapshot);
  const state = useStore.getState();
  state.pushSnapshot(current);
  state.clearRedo();

  return backup;
}

export async function pruneBackups(limit: number = MAX_BACKUPS) {
  const total = await db.backups.count();
  if (total <= limit) return;

  const toRemove = await db.backups
    .orderBy("createdAt")
    .limit(total - limit)
    .primaryKeys();

  if (toRemove.length) {
    await db.backups.bulkDelete(toRemove as number[]);
  }
}
