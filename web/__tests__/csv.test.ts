import { describe, it, expect } from "vitest";
import { importTravelCSV, importAddressCSV } from "../services/import/csvImporter";
import { exportTravelCSV, exportAddressCSV } from "../services/export/csvExporter";
import { TravelEntry, AddressEntry } from "../db/db";

describe("CSV Services", () => {
  describe("Travel CSV", () => {
    it("should export and re-import correctly", async () => {
      const data: TravelEntry[] = [
        {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-10",
            destinationCountry: "France",
            destinationCity: "Paris",
            destination: "Paris, France",
            purposeCode: "Tourism",
            createdAt: "iso",
            updatedAt: "iso",
        }
      ];

      const csv = exportTravelCSV(data);
      expect(csv).toContain("France");
      expect(csv).toContain("Paris");

      const result = await importTravelCSV(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].destinationCountry).toBe("France");
    });
  });

  describe("Address CSV", () => {
    it("should parse legacy headers if provided", async () => {
        const csv = `Start,End,Country,City,Address\n2023-01-01,2023-02-01,USA,NY,123 St`;
        const result = await importAddressCSV(csv);
        
        expect(result.errors).toHaveLength(0);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].country).toBe("USA");
        expect(result.data[0].line1).toBe("123 St");
    });
  });
});
