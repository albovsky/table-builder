import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/db';
import { generateTravelEntries } from '../lib/generateDataset';

describe('Dexie Integration', () => {
  beforeEach(async () => {
    await db.travel.clear();
    await db.address.clear();
    await db.profile.clear();
  });

  it('can write and read travel entries', async () => {
    const entries = generateTravelEntries(10);
    await db.travel.bulkAdd(entries);
    
    const count = await db.travel.count();
    expect(count).toBe(10);
    
    const first = await db.travel.get(entries[0].id);
    expect(first).toBeDefined();
    expect(first?.destinationCountry).toBe(entries[0].destinationCountry);
  });
});
