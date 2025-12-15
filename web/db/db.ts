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

const db = new Dexie('TableBuilderDB') as Dexie & {
  profile: EntityTable<Profile, 'id'>;
  travel: EntityTable<TravelEntry, 'id'>;
  address: EntityTable<AddressEntry, 'id'>;
};

// Schema v1
db.version(1).stores({
  profile: 'id',
  travel: 'id, startDate',
  address: 'id, startDate'
});

export { db };
