import { describe, it, expect } from "vitest";
import { validateTravel, validateAddress } from "../services/validator/validator";
import { TravelEntry, AddressEntry } from "../db/db";

describe("Validator Service", () => {
  describe("validateTravel", () => {
    it("should detect overlaps", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-10",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "A",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          startDate: "2023-01-08", // Overlaps
          endDate: "2023-01-15",
          destinationCountry: "B",
          destinationCity: "B",
          destination: "B, B",
          purposeCode: "B",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors).toHaveLength(2);
      expect(errors[0].type).toBe("overlap");
    });

    it("should allow adjacent trips", () => {
        const entries: TravelEntry[] = [
          {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-10",
            destinationCountry: "A",
            destinationCity: "A",
            destination: "A, A",
            purposeCode: "A",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            startDate: "2023-01-11", // Adjacent, no overlap
            endDate: "2023-01-15",
            destinationCountry: "B",
            destinationCity: "B",
            destination: "B, B",
            purposeCode: "B",
            createdAt: "",
            updatedAt: "",
          },
        ];
  
        const errors = validateTravel(entries);
        expect(errors).toHaveLength(0);
      });
  });

  describe("validateAddress", () => {
      it("should detect gaps", () => {
        const entries: AddressEntry[] = [
            {
              id: "1",
              startDate: "2023-01-01",
              endDate: "2023-01-10",
              country: "A",
              city: "A",
              line1: "A",
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "2",
              startDate: "2023-01-15", // Gap from 10th to 15th
              endDate: null,
              country: "B",
              city: "B",
              line1: "B",
              createdAt: "",
              updatedAt: "",
            },
          ];
          const errors = validateAddress(entries);
          expect(errors).toHaveLength(1);
          expect(errors[0].type).toBe("gap");
      });

      it("should handle 'Present' correctly without gap if adjacent", () => {
        const entries: AddressEntry[] = [
            {
              id: "1",
              startDate: "2023-01-01",
              endDate: null, // Present
              country: "A",
              city: "A",
              line1: "A",
              createdAt: "",
              updatedAt: "",
            }
          ];
          const errors = validateAddress(entries);
          expect(errors).toHaveLength(0);
      });

      it("should error if 'Present' entry is followed by another entry", () => {
        const entries: AddressEntry[] = [
            {
              id: "1",
              startDate: "2023-01-01",
              endDate: null, // Present
              country: "A",
              city: "A",
              line1: "A",
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "2",
              startDate: "2023-02-01",
              endDate: null,
              country: "B",
              city: "B",
              line1: "B",
              createdAt: "",
              updatedAt: "",
            }
          ];
          // Logic says if current has no end date (null), it overlaps next
          const errors = validateAddress(entries);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].type).toBe("overlap");
      });
  });
});
