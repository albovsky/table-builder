import { nanoid } from 'nanoid';
import { TravelEntry, AddressEntry } from '../db/db';

export function generateTravelEntries(count: number): TravelEntry[] {
  const entries: TravelEntry[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const startDate = new Date(now.getFullYear() - 5, 0, 1 + i * 2).toISOString();
    const endDate = new Date(now.getFullYear() - 5, 0, 2 + i * 2).toISOString();
    const destinationString = ['New York, USA', 'Toronto, Canada', 'London, UK', 'Paris, France', 'Berlin, Germany'][i % 5];
    const [cityPart, countryPart] = destinationString.split(",").map(part => part.trim());
    
    entries.push({
      id: nanoid(),
      startDate,
      endDate,
      destination: destinationString,
      destinationCountry: countryPart || destinationString,
      destinationCity: cityPart || "",
      purposeCode: ['WORK', 'LEISURE', 'FAMILY'][i % 3],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  return entries;
}

export function generateAddressEntries(count: number): AddressEntry[] {
  const entries: AddressEntry[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const startDate = new Date(now.getFullYear() - 5, 0, 1 + i * 10).toISOString();
    const endDate = new Date(now.getFullYear() - 5, 0, 10 + i * 10).toISOString();
    
    entries.push({
      id: nanoid(),
      startDate,
      endDate,
      country: 'Canada',
      city: 'Vancouver',
      line1: `${i + 100} Main St`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  return entries;
}
