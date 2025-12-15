import { describe, it, expect } from "vitest";
import Papa from "papaparse";
import { exportTravelCSV, exportAddressCSV, copyTravelToClipboard, copyAddressToClipboard } from "../services/export/csvExporter";
import { TravelEntry, AddressEntry } from "../db/db";

describe("Export Data Integrity Tests", () => {
  describe("Travel Export", () => {
    const mockTravelData: TravelEntry[] = [
      {
        id: "1",
        startDate: "2023-01-01",
        endDate: "2023-01-10",
        destinationCountry: "France",
        destinationCity: "",
        destination: "France",
        purposeCode: "001",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        startDate: "2023-02-15",
        endDate: "2023-02-20",
        destinationCountry: "Germany",
        destinationCity: "",
        destination: "Germany",
        purposeCode: "002",
        createdAt: "2023-02-01T00:00:00.000Z",
        updatedAt: "2023-02-01T00:00:00.000Z",
      },
    ];

    it("should export all travel entries", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      expect(parsed.data).toHaveLength(mockTravelData.length);
    });

    it("should include all required columns", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      expect(parsed.meta.fields).toContain("startDate");
      expect(parsed.meta.fields).toContain("endDate");
      expect(parsed.meta.fields).toContain("amountOfDays");
      expect(parsed.meta.fields).toContain("destination");
      expect(parsed.meta.fields).toContain("purposeCode");
    });

    it("should preserve all startDate values", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      mockTravelData.forEach((entry, idx) => {
        expect((parsed.data[idx] as any).startDate).toBe(entry.startDate);
      });
    });

    it("should preserve all endDate values", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      mockTravelData.forEach((entry, idx) => {
        expect((parsed.data[idx] as any).endDate).toBe(entry.endDate);
      });
    });

    it("should preserve all destination values", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      mockTravelData.forEach((entry, idx) => {
        expect((parsed.data[idx] as any).destination).toBe(entry.destination);
      });
    });

    it("should preserve all purposeCode values", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      mockTravelData.forEach((entry, idx) => {
        expect((parsed.data[idx] as any).purposeCode).toBe(entry.purposeCode);
      });
    });

    it("should calculate amountOfDays correctly", () => {
      const csv = exportTravelCSV(mockTravelData);
      const parsed = Papa.parse(csv, { header: true });
      
      // First entry: Jan 1 to Jan 10 = 10 days
      expect((parsed.data[0] as any).amountOfDays).toBe("10");
      // Second entry: Feb 15 to Feb 20 = 6 days
      expect((parsed.data[1] as any).amountOfDays).toBe("6");
    });

    it("should handle null endDate gracefully", () => {
      const dataWithNull: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: null,
          destinationCountry: "France",
          destinationCity: "",
          destination: "France",
          purposeCode: "001",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      const csv = exportTravelCSV(dataWithNull);
      const parsed = Papa.parse(csv, { header: true });
      
      expect((parsed.data[0] as any).endDate).toBe("");
      expect((parsed.data[0] as any).amountOfDays).toBe("0");
    });

    it("should not corrupt special characters", () => {
      const specialData: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-10",
          destinationCountry: "Brazil",
          destinationCity: "São Paulo",
          destination: "São Paulo, Brazil",
          purposeCode: "Tourism & Business",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      const csv = exportTravelCSV(specialData);
      const parsed = Papa.parse(csv, { header: true });
      
      expect((parsed.data[0] as any).destination).toBe("São Paulo, Brazil");
      expect((parsed.data[0] as any).purposeCode).toBe("Tourism & Business");
    });
  });

  describe("Address Export", () => {
    const mockAddressData: AddressEntry[] = [
      {
        id: "1",
        startDate: "2023-01-01",
        endDate: "2023-06-30",
        country: "Canada",
        city: "Toronto",
        line1: "123 Main St",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        startDate: "2023-07-01",
        endDate: "2023-12-31",
        country: "USA",
        city: "New York",
        line1: "456 Broadway",
        createdAt: "2023-07-01T00:00:00.000Z",
        updatedAt: "2023-07-01T00:00:00.000Z",
      },
    ];

    it("should export all address entries", () => {
      const csv = exportAddressCSV(mockAddressData);
      const parsed = Papa.parse(csv, { header: true });
      
      expect(parsed.data).toHaveLength(mockAddressData.length);
    });

    it("should include all required columns", () => {
      const csv = exportAddressCSV(mockAddressData);
      const parsed = Papa.parse(csv, { header: true });
      
      expect(parsed.meta.fields).toContain("startDate");
      expect(parsed.meta.fields).toContain("endDate");
      expect(parsed.meta.fields).toContain("country");
      expect(parsed.meta.fields).toContain("city");
      expect(parsed.meta.fields).toContain("line1");
    });

    it("should preserve all field values", () => {
      const csv = exportAddressCSV(mockAddressData);
      const parsed = Papa.parse(csv, { header: true });
      
      mockAddressData.forEach((entry, idx) => {
        expect((parsed.data[idx] as any).startDate).toBe(entry.startDate);
        expect((parsed.data[idx] as any).endDate).toBe(entry.endDate);
        expect((parsed.data[idx] as any).country).toBe(entry.country);
        expect((parsed.data[idx] as any).city).toBe(entry.city);
        expect((parsed.data[idx] as any).line1).toBe(entry.line1);
      });
    });

    it("should handle optional fields correctly", () => {
      const dataWithOptional: AddressEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          country: "Canada",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      const csv = exportAddressCSV(dataWithOptional);
      const parsed = Papa.parse(csv, { header: true });
      
      expect((parsed.data[0] as any).country).toBe("Canada");
      // Optional fields should be empty strings in CSV
      expect((parsed.data[0] as any).city).toBe("");
      expect((parsed.data[0] as any).line1).toBe("");
    });
  });

  describe("Clipboard Export (TSV)", () => {
    it("should use tab delimiter for travel data", async () => {
      const mockData: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-10",
          destinationCountry: "France",
          destinationCity: "",
          destination: "France",
          purposeCode: "001",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      // Mock clipboard API
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      await copyTravelToClipboard(mockData);
      
      const tsvContent = mockWriteText.mock.calls[0][0];
      expect(tsvContent).toContain("\t"); // Should contain tabs
      expect(tsvContent).not.toContain(","); // Should not use commas in data
    });

    it("should include amountOfDays in clipboard export", async () => {
      const mockData: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-10",
          destinationCountry: "France",
          destinationCity: "",
          destination: "France",
          purposeCode: "001",
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      await copyTravelToClipboard(mockData);
      
      const tsvContent = mockWriteText.mock.calls[0][0];
      const lines = tsvContent.split("\n");
      const headers = lines[0].split("\t");
      
      expect(headers).toContain("amountOfDays");
    });
  });
});
