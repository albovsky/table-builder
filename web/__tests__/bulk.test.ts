import { describe, it, expect, beforeEach } from "vitest";
import { db, type AddressEntry } from "@/db/db";
import { generateTravelEntries } from "@/lib/generateDataset";
import {
  bulkDeleteTravelEntries,
  bulkDuplicateTravelEntries,
  bulkUpdateTravelPurpose,
  bulkUpdateTravelLocation,
} from "@/features/travel/hooks/useTravelData";
import {
  bulkDeleteAddressEntries,
  bulkDuplicateAddressEntries,
  bulkUpdateAddressLocation,
} from "@/features/address/hooks/useAddressData";

describe("Bulk operations", () => {
  beforeEach(async () => {
    await db.travel.clear();
    await db.address.clear();
    await db.profile.clear();
  });

  it("bulk delete travel entries", async () => {
    const entries = generateTravelEntries(3);
    await db.travel.bulkAdd(entries);
    await bulkDeleteTravelEntries([entries[0].id, entries[1].id]);
    const remaining = await db.travel.count();
    expect(remaining).toBe(1);
  });

  it("bulk duplicate travel entries", async () => {
    const entries = generateTravelEntries(2);
    await db.travel.bulkAdd(entries);
    await bulkDuplicateTravelEntries(entries.map((e) => e.id));
    const count = await db.travel.count();
    expect(count).toBe(4);
  });

  it("bulk update travel purpose and location", async () => {
    const entries = generateTravelEntries(2);
    await db.travel.bulkAdd(entries);
    await bulkUpdateTravelPurpose(entries.map((e) => e.id), "Work");
    await bulkUpdateTravelLocation(entries.map((e) => e.id), "CityX", "CountryY");
    const updated = await db.travel.toArray();
    updated.forEach((e) => {
      expect(e.purposeCode).toBe("Work");
      expect(e.destinationCity).toBe("CityX");
      expect(e.destinationCountry).toBe("CountryY");
    });
  });

  it("bulk delete address entries", async () => {
    const now = new Date().toISOString();
    const addresses: AddressEntry[] = [
      { id: "a1", startDate: "2020-01-01", endDate: "2020-02-01", country: "A", city: "X", line1: "", createdAt: now, updatedAt: now },
      { id: "a2", startDate: "2020-03-01", endDate: "2020-04-01", country: "B", city: "Y", line1: "", createdAt: now, updatedAt: now },
    ];
    await db.address.bulkAdd(addresses);
    await bulkDeleteAddressEntries(["a1"]);
    expect(await db.address.count()).toBe(1);
  });

  it("bulk duplicate and update address location", async () => {
    const now = new Date().toISOString();
    const addresses: AddressEntry[] = [
      { id: "a1", startDate: "2020-01-01", endDate: "2020-02-01", country: "A", city: "X", line1: "", createdAt: now, updatedAt: now },
    ];
    await db.address.bulkAdd(addresses);
    await bulkDuplicateAddressEntries(["a1"]);
    await bulkUpdateAddressLocation(["a1"], "NewCity", "NewCountry");
    const updated = await db.address.get("a1");
    expect(updated?.city).toBe("NewCity");
    expect(updated?.country).toBe("NewCountry");
    expect(await db.address.count()).toBe(2);
  });
});
