import Papa from "papaparse";
import { TravelEntry, AddressEntry } from "@/db/db";

function calculateDays(startDate: string, endDate: string | null): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
}

function formatDestination(entry: TravelEntry): string {
    if (entry.destination && entry.destination.trim()) {
        return entry.destination;
    }

    const parts = [
        entry.destinationCity?.trim(),
        entry.destinationCountry?.trim()
    ].filter((part): part is string => Boolean(part));

    return parts.join(", ");
}

export function exportTravelCSV(data: TravelEntry[]): string {
    // Select specific fields for export
    const rows = data.map(entry => {
        const destination = formatDestination(entry);
        let destinationCountry = entry.destinationCountry?.trim() || "";
        let destinationCity = entry.destinationCity?.trim() || "";

        if (!destinationCountry || !destinationCity) {
            const parts = destination.split(",").map(part => part.trim()).filter(Boolean);
            if (!destinationCountry && parts.length) {
                destinationCountry = parts[parts.length - 1];
            }
            if (!destinationCity && parts.length > 1) {
                destinationCity = parts.slice(0, -1).join(", ");
            }
        }

        return {
            startDate: entry.startDate,
            endDate: entry.endDate ?? "",
            amountOfDays: calculateDays(entry.startDate, entry.endDate),
            destination,
            destinationCountry,
            destinationCity,
            purposeCode: entry.purposeCode
        };
    });
    return Papa.unparse(rows);
}

export function exportAddressCSV(data: AddressEntry[]): string {
    const rows = data.map(entry => ({
        startDate: entry.startDate,
        endDate: entry.endDate,
        country: entry.country,
        city: entry.city,
        line1: entry.line1
    }));
    return Papa.unparse(rows);
}

export async function copyTravelToClipboard(data: TravelEntry[]): Promise<void> {
    const rows = data.map(entry => {
        const destination = formatDestination(entry);
        let destinationCountry = entry.destinationCountry?.trim() || "";
        let destinationCity = entry.destinationCity?.trim() || "";

        if (!destinationCountry || !destinationCity) {
            const parts = destination.split(",").map(part => part.trim()).filter(Boolean);
            if (!destinationCountry && parts.length) {
                destinationCountry = parts[parts.length - 1];
            }
            if (!destinationCity && parts.length > 1) {
                destinationCity = parts.slice(0, -1).join(", ");
            }
        }

        return {
            startDate: entry.startDate,
            endDate: entry.endDate ?? "",
            amountOfDays: calculateDays(entry.startDate, entry.endDate),
            destination,
            destinationCountry,
            destinationCity,
            purposeCode: entry.purposeCode
        };
    });
    const tsv = Papa.unparse(rows, { delimiter: "\t" });
    await navigator.clipboard.writeText(tsv);
}

export async function copyAddressToClipboard(data: AddressEntry[]): Promise<void> {
    const rows = data.map(entry => ({
        startDate: entry.startDate,
        endDate: entry.endDate,
        country: entry.country,
        city: entry.city,
        line1: entry.line1
    }));
    const tsv = Papa.unparse(rows, { delimiter: "\t" });
    await navigator.clipboard.writeText(tsv);
}

export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
