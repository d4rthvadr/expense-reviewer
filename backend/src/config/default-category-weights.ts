import { Category } from '@domain/enum/category.enum';

/**
 * Default category weights used for spending allocation analysis.
 * Values represent the recommended percentage of total spending per category.
 * Sum should equal 1.0 (100%) for balanced allocation.
 */
export const DEFAULT_CATEGORY_WEIGHTS: Record<Category, number> = {
  HOUSING: 0.3, // 30% - Rent, mortgage, utilities (biggest expense)
  FOOD: 0.15, // 15% - Groceries, dining out
  TRANSPORT: 0.12, // 12% - Car payments, gas, public transport
  UTILITIES: 0.08, // 8% - Phone, internet, electricity (separate from housing)
  HEALTH: 0.05, // 5% - Medical, insurance, pharmacy
  SAVINGS_OR_INVESTMENTS: 0.1, // 10% - Emergency fund, retirement, investments
  ENTERTAINMENT: 0.05, // 5% - Movies, subscriptions, hobbies
  SHOPPING: 0.05, // 5% - Clothing, personal items
  EDUCATION: 0.03, // 3% - Books, courses, training
  PERSONAL_AND_LIFESTYLE: 0.03, // 3% - Grooming, personal care
  TRAVEL: 0.02, // 2% - Vacations, business travel
  GIFTS_OR_DONATIONS: 0.01, // 1% - Charitable giving, presents
  INSURANCE: 0.005, // 0.5% - Life, disability insurance (excluding health)
  MISCELLANEOUS: 0.0025, // 0.25% - Unexpected or uncategorized
  OTHER: 0.0025, // 0.25% - Catch-all category
} as const;

/**
 * Validates that the sum of default weights equals 1.0 (within tolerance)
 */
export function validateDefaultWeights(): boolean {
  const sum = Object.values(DEFAULT_CATEGORY_WEIGHTS).reduce(
    (acc, weight) => acc + weight,
    0
  );
  const tolerance = 0.001; // Allow small floating-point differences
  return Math.abs(sum - 1.0) < tolerance;
}

/**
 * Gets the default weight for a specific category
 */
export function getDefaultWeight(category: Category): number {
  return DEFAULT_CATEGORY_WEIGHTS[category];
}

/**
 * Gets all default weights as an array of objects for database seeding
 */
export function getDefaultWeightsForSeeding() {
  return Object.entries(DEFAULT_CATEGORY_WEIGHTS).map(([category, weight]) => ({
    category: category as Category,
    weight: weight.toString(), // Convert to string for Decimal type
  }));
}

// Validate weights on module load (development check)
if (!validateDefaultWeights()) {
  throw new Error(
    `Default category weights do not sum to 1.0: ${Object.values(
      DEFAULT_CATEGORY_WEIGHTS
    ).reduce((acc, weight) => acc + weight, 0)}`
  );
}
