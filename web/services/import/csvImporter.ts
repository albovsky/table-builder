import Papa from "papaparse";
import { TravelEntry, AddressEntry } from "@/db/db";
import { nanoid } from "nanoid";

export interface ImportResult<T> {
  data: T[];
  errors: string[];
}

export function importTravelCSV(csvString: string): Promise<ImportResult<TravelEntry>> {
  return new Promise((resolve) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: TravelEntry[] = [];
        const errors: string[] = results.errors.map((e) => e.message);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results.data.forEach((row: any, index) => {
          try {
             const destinationCountry = row.destinationCountry || row.country || row.Country || "";
             const destinationCity = row.destinationCity || row.city || row.City || "";
             const destination = row.destination || [destinationCity, destinationCountry].filter(Boolean).join(", ");
             const rawEndDate = row.endDate ?? row.End ?? null;
             const normalizedEndDate = rawEndDate === "" ? null : rawEndDate;
             let normalizedCountry = String(destinationCountry || "").trim();
             let normalizedCity = String(destinationCity || "").trim();

             if ((!normalizedCountry || !normalizedCity) && destination) {
                 const parts = destination.split(",").map((part: string) => part.trim()).filter(Boolean);
                 if (!normalizedCountry && parts.length) {
                    normalizedCountry = parts[parts.length - 1];
                 }
                 if (!normalizedCity && parts.length > 1) {
                    normalizedCity = parts.slice(0, -1).join(", ");
                 }
             }
             // Basic mapping - assumes headers match or close enough
             // In a real app we might need a mapping step
             const entry: TravelEntry = {
                 id: nanoid(),
                 startDate: row.startDate || row.Start || "", // Basic fallback
                 endDate: normalizedEndDate,
                 destinationCountry: normalizedCountry,
                 destinationCity: normalizedCity,
                 destination,
                 purposeCode: row.purposeCode || row.Purpose || "",
                 createdAt: new Date().toISOString(),
                 updatedAt: new Date().toISOString(),
             };
             data.push(entry);
          } catch (e) {
              errors.push(`Row ${index + 1}: Failed to parse data. ${e}`);
          }
        });

        resolve({ data, errors });
      },
      error: (error: Error) => {
          resolve({ data: [], errors: [error.message] });
      }
    });
  });
}

export function importAddressCSV(csvString: string): Promise<ImportResult<AddressEntry>> {
    return new Promise((resolve) => {
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data: AddressEntry[] = [];
          const errors: string[] = results.errors.map((e) => e.message);
  
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results.data.forEach((row: any, index) => {
            try {
               const entry: AddressEntry = {
                   id: nanoid(),
                   startDate: row.startDate || row.Start || "",
                   endDate: row.endDate || row.End || null,
                   country: row.country || row.Country || "",
                   city: row.city || row.City || "",
                   line1: row.line1 || row.Address || "",
                   createdAt: new Date().toISOString(),
                   updatedAt: new Date().toISOString(),
               };
               data.push(entry);
            } catch (e) {
                errors.push(`Row ${index + 1}: Failed to parse data. ${e}`);
            }
          });
  
          resolve({ data, errors });
        },
        error: (error: Error) => {
            resolve({ data: [], errors: [error.message] });
        }
      });
    });
  }
