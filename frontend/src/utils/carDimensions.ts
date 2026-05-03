/**
 * Approximate car dimensions by body type.
 * Length and width in meters, based on typical vehicle sizes for the Egyptian market.
 */
export interface CarDimensions {
  length: number;  // meters
  width: number;   // meters (excluding mirrors)
  label: string;
}

export const carDimensionsByType: Record<string, CarDimensions> = {
  Sedan: { length: 4.6, width: 1.8, label: 'Sedan' },
  Hatchback: { length: 4.1, width: 1.75, label: 'Hatchback' },
  SUV: { length: 4.8, width: 1.9, label: 'SUV' },
  Crossover: { length: 4.5, width: 1.85, label: 'Crossover' },
  Coupe: { length: 4.6, width: 1.8, label: 'Coupe' },
  Minivan: { length: 5.0, width: 1.9, label: 'Minivan' },
  Pickup: { length: 5.3, width: 1.85, label: 'Pickup' },
  Convertible: { length: 4.4, width: 1.8, label: 'Convertible' },
  Wagon: { length: 4.7, width: 1.8, label: 'Wagon' },
};

/** Default dimensions if body type is unknown */
export const defaultDimensions: CarDimensions = { length: 4.6, width: 1.8, label: 'Car' };

export function getCarDimensions(bodyType: string | null | undefined): CarDimensions {
  if (!bodyType) return defaultDimensions;
  return carDimensionsByType[bodyType] || defaultDimensions;
}