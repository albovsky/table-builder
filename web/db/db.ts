import Dexie, { type EntityTable } from 'dexie';

interface Profile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface BaseEntry {
  id: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelEntry extends BaseEntry {
  destinationCountry: string;
  destinationCity?: string;
  destination: string; // Combined (city, country) for legacy display/exports
  purposeCode: string;
}

export interface AddressEntry extends BaseEntry {
  country: string;
  city?: string;
  line1?: string;
}

export interface BackupRecord {
  id?: number;
  version: number;
  createdAt: number;
  snapshot: {
    travel: TravelEntry[];
    address: AddressEntry[];
    timestamp: number;
  };
}

const db = new Dexie('TableBuilderDB') as Dexie & {
  profile: EntityTable<Profile, 'id'>;
  travel: EntityTable<TravelEntry, 'id'>;
  address: EntityTable<AddressEntry, 'id'>;
  backups: EntityTable<BackupRecord, 'id'>;
};

// Schema v2 (adds backups)
db.version(2)
  .stores({
    profile: 'id',
    travel: 'id, startDate',
    address: 'id, startDate',
    backups: '++id, createdAt',
  })
  .upgrade(() => {
    // No data migration needed; new store added.
  });

export { db };
