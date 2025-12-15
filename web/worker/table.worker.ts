
// Web Worker for heavy lifting (validation, export)

import { validateTravel, validateAddress } from "../services/validator/validator";
import { exportTravelCSV, exportAddressCSV } from "../services/export/csvExporter";
import { TravelEntry, AddressEntry } from "@/db/db";

self.onmessage = (e: MessageEvent) => {
  const { type, payload, id } = e.data;
  let result;

  try {
      switch (type) {
        case "VALIDATE_TRAVEL":
            result = validateTravel(payload as TravelEntry[]);
            break;
        case "VALIDATE_ADDRESS":
            result = validateAddress(payload as AddressEntry[]);
            break;
        case "EXPORT_TRAVEL":
            result = exportTravelCSV(payload as TravelEntry[]);
            break;
        case "EXPORT_ADDRESS":
            result = exportAddressCSV(payload as AddressEntry[]);
            break;
        default:
            throw new Error(`Unknown message type: ${type}`);
      }
      self.postMessage({ id, status: "success", result });
  } catch (err: unknown) {
      self.postMessage({ id, status: "error", error: err instanceof Error ? err.message : "" + err });
  }
};

