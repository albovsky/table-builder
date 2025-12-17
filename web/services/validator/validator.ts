import { TravelEntry, AddressEntry } from "@/db/db";

export type FixAction =
  | {
      type: "FILL_GAP";
      label: string;
      payload: {
        startDate: string;
        endDate: string;
      };
    }
  | {
      type: "DELETE_ROW";
      label: string;
    };

export interface ValidationError {
  id: string; // Entry ID causing the error
  source: 'travel' | 'address';
  type:
    | "gap"
    | "overlap"
    | "order"
    | "invalid"
    | "too short"
    | "too long"
    | "unfinished"
    | "long stay";
  message: string;
  severity: "error" | "warning";
  fixAction?: FixAction;
  relatedId?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const PURPOSE_MIN_CHARS = 5;
const PURPOSE_MAX_CHARS = 60;
const PURPOSE_MAX_WORDS = 5;
const LONG_STAY_DAYS = 183;
const ADDRESS_MIN_CHARS = 5;
const ADDRESS_MAX_CHARS = 60;
const ADDRESS_PLACEHOLDERS = new Set(["Select Country", "Select City", "Enter Address"]);

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const isBlank = (value: string | null | undefined) => !value || value.trim() === "";

const isPlaceholder = (value: string | null | undefined, placeholders: Set<string>) => {
  if (!value) return false;
  return placeholders.has(value.trim());
};

const parseIsoToUtc = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const utc = Date.UTC(y, m - 1, d);
  return Number.isNaN(utc) ? null : utc;
};

const calculateDurationDays = (start: string, end: string) => {
  const startUtc = parseIsoToUtc(start);
  const endUtc = parseIsoToUtc(end);
  if (startUtc === null || endUtc === null) return null;
  const diff = endUtc - startUtc;
  if (diff < 0) return null;
  return Math.ceil(diff / DAY_MS);
};

const formatMissingFields = (fields: string[]) => {
  if (fields.length <= 1) return fields[0] ?? "";
  if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
  return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`;
};

const buildUnfinishedMessage = (rowNumber: number, missingFields: string[]) => {
  if (!missingFields.length) return "";
  if (missingFields.length >= 4) {
    return `Row ${rowNumber} is empty. Complete the info or delete the row.`;
  }
  const fieldsLabel = formatMissingFields(missingFields);
  const verb = missingFields.length === 1 ? "field is" : "fields are";
  return `Row ${rowNumber} is unfinished. ${fieldsLabel} ${verb} empty. Complete the info or delete the row.`;
};

const getTravelDestination = (entry: TravelEntry) => {
  const combined = entry.destination?.trim();
  if (combined) return combined;

  const parts = [
    entry.destinationCity?.trim(),
    entry.destinationCountry?.trim(),
  ].filter((part): part is string => Boolean(part));

  return parts.length ? parts.join(", ") : "";
};

const addLengthWarnings = ({
  value,
  rowNumber,
  id,
  source,
  fieldLabel,
  minChars,
  maxChars,
  maxWords,
  errors,
  shortHint,
  longHint,
}: {
  value: string;
  rowNumber: number;
  id: string;
  source: "travel" | "address";
  fieldLabel: string;
  minChars: number;
  maxChars: number;
  maxWords?: number;
  errors: ValidationError[];
  shortHint: string;
  longHint: string;
}) => {
  const trimmed = value.trim();
  if (!trimmed) return;
  const length = trimmed.length;
  const wordCount = countWords(trimmed);

  if (length < minChars) {
    errors.push({
      id,
      source,
      type: "too short",
      message: `Row ${rowNumber} ${fieldLabel} is too short. ${shortHint}`,
      severity: "warning",
    });
    return;
  }

  if (length > maxChars || (maxWords !== undefined && wordCount > maxWords)) {
    errors.push({
      id,
      source,
      type: "too long",
      message: `Row ${rowNumber} ${fieldLabel} is too long. ${longHint}`,
      severity: "warning",
    });
  }
};

export function validateTravel(
  entries: TravelEntry[],
  options: { checkGaps?: boolean } = {}
): ValidationError[] {
  const errors: ValidationError[] = [];
  const sorted = [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const checkGaps = options.checkGaps ?? false;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentRow = i + 1;
    
    // Check internal validity
    if (current.endDate && current.startDate > current.endDate) {
      errors.push({
        id: current.id,
        source: 'travel',
        type: "invalid",
        message: "End date cannot be before start date.",
        severity: "error",
      });
    }

    const startValue = current.startDate?.trim();
    const endValue = current.endDate?.trim();
    if (startValue && endValue) {
      const stayDays = calculateDurationDays(startValue, endValue);
      if (stayDays !== null && stayDays >= LONG_STAY_DAYS) {
        errors.push({
          id: current.id,
          source: "travel",
          type: "long stay",
          message: `Heads up: row ${currentRow} stayed longer than 6 months, so you will probably need a police certificate.`,
          severity: "warning",
        });
      }
    }

    addLengthWarnings({
      value: current.purposeCode ?? "",
      rowNumber: currentRow,
      id: current.id,
      source: "travel",
      fieldLabel: "purpose",
      minChars: PURPOSE_MIN_CHARS,
      maxChars: PURPOSE_MAX_CHARS,
      maxWords: PURPOSE_MAX_WORDS,
      errors,
      shortHint: "Aim for something more descriptive, 1-5 words.",
      longHint: "Shorten to 1-5 words.",
    });

    const missingTravelFields: string[] = [];
    const destinationValue = getTravelDestination(current);

    if (isBlank(current.startDate)) missingTravelFields.push("Start Date");
    if (isBlank(current.endDate)) missingTravelFields.push("End Date");
    if (isBlank(destinationValue)) missingTravelFields.push("City and Country");
    if (isBlank(current.purposeCode)) missingTravelFields.push("Purpose");

    if (missingTravelFields.length > 0) {
      errors.push({
        id: current.id,
        source: "travel",
        type: "unfinished",
        message: buildUnfinishedMessage(currentRow, missingTravelFields),
        severity: "error",
        fixAction: {
          type: "DELETE_ROW",
          label: "Delete Row",
        },
      });
    }

    // Check overlap with next
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const nextRow = i + 2;
      // Check Overlap
      if (current.endDate && next.startDate && current.endDate > next.startDate) {
        const overlapMessage = `Rows ${currentRow} and ${nextRow} overlap.`;
        errors.push({
          id: current.id,
          source: 'travel',
          type: "overlap",
          message: overlapMessage,
          severity: "error",
          relatedId: next.id,
        });
      }

      // Check Gap (Travel) - Logic: EndDate + 1 < NextStartDate
      if (checkGaps && current.endDate && next.startDate) {
          const currEnd = new Date(current.endDate);
          const nextStart = new Date(next.startDate);
          
          const gapStart = new Date(currEnd);
          gapStart.setDate(gapStart.getDate() + 1);
          
          const gapEnd = new Date(nextStart);
          gapEnd.setDate(gapEnd.getDate() - 1);

          if (gapStart <= gapEnd) {
             const startStr = gapStart.toISOString().split("T")[0];
             const endStr = gapEnd.toISOString().split("T")[0];
             const gapMessage = `Gap between rows ${currentRow} and ${nextRow}. Add a blank entry or adjust dates.`;
             
             errors.push({
                id: current.id,
                source: 'travel',
                type: "gap",
                message: gapMessage,
                severity: "error",
                relatedId: next.id,
                fixAction: {
                    type: "FILL_GAP",
                    label: "Add Blank Entry",
                    payload: { startDate: startStr, endDate: endStr }
                }
             });
          }
      }
    }
  }

  return errors;
}

export function validateAddress(entries: AddressEntry[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const sorted = [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentRow = i + 1;

    // Check internal validity
    if (current.endDate && current.startDate > current.endDate) {
       errors.push({
        id: current.id,
        source: 'address',
        type: "invalid",
        message: "End date cannot be before start date.",
        severity: "error",
      });
    }

    addLengthWarnings({
      value: current.line1 ?? "",
      rowNumber: currentRow,
      id: current.id,
      source: "address",
      fieldLabel: "address",
      minChars: ADDRESS_MIN_CHARS,
      maxChars: ADDRESS_MAX_CHARS,
      errors,
      shortHint: "Add a fuller street address.",
      longHint: "Consider shortening the line.",
    });

    const missingAddressFields: string[] = [];
    const isCountryMissing =
      isBlank(current.country) || isPlaceholder(current.country, ADDRESS_PLACEHOLDERS);
    const isCityMissing = isBlank(current.city) || isPlaceholder(current.city, ADDRESS_PLACEHOLDERS);
    const isLine1Missing =
      isBlank(current.line1) || isPlaceholder(current.line1, ADDRESS_PLACEHOLDERS);

    if (isBlank(current.startDate)) missingAddressFields.push("Start Date");
    if (isCountryMissing) missingAddressFields.push("Country");
    if (isCityMissing) missingAddressFields.push("City");
    if (isLine1Missing) missingAddressFields.push("Address Line 1");

    if (missingAddressFields.length > 0) {
      errors.push({
        id: current.id,
        source: "address",
        type: "unfinished",
        message: buildUnfinishedMessage(currentRow, missingAddressFields),
        severity: "error",
        fixAction: {
          type: "DELETE_ROW",
          label: "Delete Row",
        },
      });
    }

    // Check overlap and gap with next
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const nextRow = i + 2;
      const overlapLabel = `Rows ${currentRow} and ${nextRow} overlap.`;
      
      if (!current.endDate) {
           errors.push({
            id: current.id,
            source: 'address',
            type: "overlap",
            message: `${overlapLabel} A 'Present' entry is followed by another address.`,
            severity: "error",
            relatedId: next.id,
          });
      } else {
          // Check Overlap
          if (next.startDate && current.endDate > next.startDate) {
               errors.push({
                id: current.id,
                source: 'address',
                type: "overlap",
                message: overlapLabel,
                severity: "error",
                relatedId: next.id,
              });
          }
          // Check Gap
          if (next.startDate) {
            const currEnd = new Date(current.endDate);
            const nextStart = new Date(next.startDate);
            
            const gapStart = new Date(currEnd);
            gapStart.setDate(gapStart.getDate() + 1);
            
            const gapEnd = new Date(nextStart);
            gapEnd.setDate(gapEnd.getDate() - 1);

            if (gapStart <= gapEnd) {
                const startStr = gapStart.toISOString().split("T")[0];
                const endStr = gapEnd.toISOString().split("T")[0];
                const gapMessage = `Gap between rows ${currentRow} and ${nextRow}. Fill or adjust dates.`;

                errors.push({
                    id: current.id,
                    source: 'address',
                    type: "gap",
                    message: gapMessage,
                    severity: "error",
                    fixAction: {
                      type: "FILL_GAP",
                      label: "Fill Gap",
                      payload: { startDate: startStr, endDate: endStr }
                  }
                });
            }
          }
      }
    }
  }

  return errors;
}
