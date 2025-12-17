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
          purposeCode: "Tourism",
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
          purposeCode: "Business trip",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe("overlap");
      expect(errors[0].id).toBe("1");
      expect(errors[0].relatedId).toBe("2");
      expect(errors[0].message).toContain("Rows 1 and 2");
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
            purposeCode: "Tourism",
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
            purposeCode: "Conference",
            createdAt: "",
            updatedAt: "",
          },
        ];
  
        const errors = validateTravel(entries);
        expect(errors).toHaveLength(0);
      });

    it("should not flag travel gaps by default", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-05",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "Tourism",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          startDate: "2023-01-10",
          endDate: "2023-01-12",
          destinationCountry: "B",
          destinationCity: "B",
          destination: "B, B",
          purposeCode: "Conference",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors.some((e) => e.type === "gap")).toBe(false);
    });

    it("should flag travel gaps when enabled", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-05",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "Tourism",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          startDate: "2023-01-10",
          endDate: "2023-01-12",
          destinationCountry: "B",
          destinationCity: "B",
          destination: "B, B",
          purposeCode: "Conference",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries, { checkGaps: true });
      expect(errors.some((e) => e.type === "gap")).toBe(true);
    });

    it("should flag unfinished travel rows", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: null,
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "Tourism",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      const unfinished = errors.find((e) => e.type === "unfinished");
      expect(unfinished?.severity).toBe("error");
      expect(unfinished?.fixAction?.type).toBe("DELETE_ROW");
      expect(unfinished?.message).toContain("End Date field is empty");
    });

    it("should warn when purpose is too short", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-05",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "A",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors.some((e) => e.type === "too short" && e.severity === "warning")).toBe(true);
    });

    it("should warn when purpose is too long", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-01-05",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "x".repeat(70),
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors.some((e) => e.type === "too long" && e.severity === "warning")).toBe(true);
    });

    it("should warn when stay exceeds 6 months", () => {
      const entries: TravelEntry[] = [
        {
          id: "1",
          startDate: "2023-01-01",
          endDate: "2023-07-05",
          destinationCountry: "A",
          destinationCity: "A",
          destination: "A, A",
          purposeCode: "Tourism",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const errors = validateTravel(entries);
      expect(errors.some((e) => e.type === "long stay" && e.severity === "warning")).toBe(true);
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
              line1: "123 Main St",
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "2",
              startDate: "2023-01-15", // Gap from 10th to 15th
              endDate: null,
              country: "B",
              city: "B",
              line1: "456 Oak Ave",
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
              line1: "123 Main St",
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
              line1: "123 Main St",
              createdAt: "",
              updatedAt: "",
            },
            {
              id: "2",
              startDate: "2023-02-01",
              endDate: null,
              country: "B",
              city: "B",
              line1: "456 Oak Ave",
              createdAt: "",
              updatedAt: "",
            }
          ];
          // Logic says if current has no end date (null), it overlaps next
          const errors = validateAddress(entries);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0].type).toBe("overlap");
          expect(errors.find((e) => e.id === "1")?.relatedId).toBe("2");
          expect(errors[0].message).toContain("Rows 1 and 2");
      });

      it("should include related ids for overlapping address ranges", () => {
        const entries: AddressEntry[] = [
          {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-10",
            country: "A",
            city: "A",
            line1: "123 Main St",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "2",
            startDate: "2023-01-05", // Overlaps
            endDate: "2023-01-12",
            country: "B",
            city: "B",
            line1: "456 Oak Ave",
            createdAt: "",
            updatedAt: "",
          },
        ];

        const errors = validateAddress(entries);
        expect(errors).toHaveLength(1);
        expect(errors[0].id).toBe("1");
        expect(errors[0].relatedId).toBe("2");
        expect(errors[0].message).toContain("Rows 1 and 2");
      });

      it("should flag unfinished address rows", () => {
        const entries: AddressEntry[] = [
          {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-05",
            country: "",
            city: "",
            line1: "",
            createdAt: "",
            updatedAt: "",
          },
        ];

      const errors = validateAddress(entries);
      const unfinished = errors.find((e) => e.type === "unfinished");
      expect(unfinished?.severity).toBe("error");
      expect(unfinished?.fixAction?.type).toBe("DELETE_ROW");
      expect(unfinished?.message).toContain("Country, City, and Address Line 1 fields are empty");
    });

      it("should warn when address is too short", () => {
        const entries: AddressEntry[] = [
          {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-05",
            country: "A",
            city: "A",
            line1: "A",
            createdAt: "",
            updatedAt: "",
          },
        ];

        const errors = validateAddress(entries);
        expect(errors.some((e) => e.type === "too short" && e.severity === "warning")).toBe(true);
      });

      it("should warn when address is too long", () => {
        const entries: AddressEntry[] = [
          {
            id: "1",
            startDate: "2023-01-01",
            endDate: "2023-01-05",
            country: "A",
            city: "A",
            line1: "x".repeat(70),
            createdAt: "",
            updatedAt: "",
          },
        ];

        const errors = validateAddress(entries);
        expect(errors.some((e) => e.type === "too long" && e.severity === "warning")).toBe(true);
      });
  });
});
