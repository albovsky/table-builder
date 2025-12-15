import { TravelEntry, AddressEntry } from "@/db/db";

export interface FixAction {
  type: "FILL_GAP";
  label: string;
  payload: {
    startDate: string;
    endDate: string;
  };
}

export interface ValidationError {
  id: string; // Entry ID causing the error
  source: 'travel' | 'address';
  type: "gap" | "overlap" | "order" | "invalid";
  message: string;
  severity: "error" | "warning";
  fixAction?: FixAction;
}

const describeDestination = (entry: TravelEntry) => {
  const combined = entry.destination?.trim();
  if (combined) return combined;

  const parts = [
    entry.destinationCity?.trim(),
    entry.destinationCountry?.trim(),
  ].filter((part): part is string => Boolean(part));

  return parts.length ? parts.join(", ") : "Unknown";
};

export function validateTravel(entries: TravelEntry[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const sorted = [...entries].sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    
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

    // Check overlap with next
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      // Check Overlap
      if (current.endDate && current.endDate > next.startDate) {
         errors.push({
          id: current.id,
          source: 'travel',
          type: "overlap",
          message: `Overlaps with next journey to ${describeDestination(next)}.`,
          severity: "error",
        });
        errors.push({
          id: next.id,
          source: 'travel',
          type: "overlap",
          message: `Overlaps with previous journey to ${describeDestination(current)}.`,
          severity: "error",
        });
      }

      // Check Gap (Travel) - Logic: EndDate + 1 < NextStartDate
      if (current.endDate) {
          const currEnd = new Date(current.endDate);
          const nextStart = new Date(next.startDate);
          
          const gapStart = new Date(currEnd);
          gapStart.setDate(gapStart.getDate() + 1);
          
          const gapEnd = new Date(nextStart);
          gapEnd.setDate(gapEnd.getDate() - 1);

          if (gapStart <= gapEnd) {
             const startStr = gapStart.toISOString().split("T")[0];
             const endStr = gapEnd.toISOString().split("T")[0];
             
             errors.push({
                id: current.id,
                source: 'travel',
                type: "gap",
                message: `Gap detected: ${startStr} to ${endStr}`,
                severity: "warning", // Warning for travel, as "Home" is implicit
                fixAction: {
                    type: "FILL_GAP",
                    label: "Add 'Home' Entry",
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

    // Check overlap and gap with next
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      
      if (!current.endDate) {
           errors.push({
            id: current.id,
            source: 'address',
            type: "overlap",
            message: "This entry is marked as 'Present' but is followed by another address.",
            severity: "error",
          });
      } else {
          // Check Overlap
          if (current.endDate > next.startDate) {
               errors.push({
                id: current.id,
                source: 'address',
                type: "overlap",
                message: "Overlaps with next address.",
                severity: "error",
              });
              errors.push({
                id: next.id,
                source: 'address',
                type: "overlap",
                message: "Overlaps with previous address.",
                severity: "error",
              });
          }
          // Check Gap
          const currEnd = new Date(current.endDate);
          const nextStart = new Date(next.startDate);
          
          const gapStart = new Date(currEnd);
          gapStart.setDate(gapStart.getDate() + 1);
          
          const gapEnd = new Date(nextStart);
          gapEnd.setDate(gapEnd.getDate() - 1);

          if (gapStart <= gapEnd) {
              const startStr = gapStart.toISOString().split("T")[0];
              const endStr = gapEnd.toISOString().split("T")[0];

              errors.push({
                  id: current.id,
                  source: 'address',
                  type: "gap",
                  message: `Gap detected (${startStr} to ${endStr}).`,
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

  return errors;
}
