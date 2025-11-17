import { Category } from '@domain/enum/category.enum';
import { body } from 'express-validator';
import { validateWeightsSum } from '@config/default-category-weights';

export const updateCategoryWeightsValidators = [
  body('weights')
    .isArray({ min: 1 })
    .withMessage('Weights must be a non-empty array'),
  body('weights.*.category')
    .isString()
    .withMessage('Category must be a string')
    .isIn(Object.values(Category))
    .withMessage(
      `Category must be a valid category (${Object.values(Category).join(', ')})`
    ),
  body('weights.*.weight')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Weight must be a number between 0 and 1 (inclusive)')
    .notEmpty()
    .withMessage('Weight is required'),
  body('weights')
    .custom((weights: Array<{ category: string; weight: number }>) => {
      // Check for duplicate categories
      const categories = weights.map((w) => w.category);
      const uniqueCategories = new Set(categories);

      if (categories.length !== uniqueCategories.size) {
        throw new Error('Duplicate categories are not allowed');
      }

      // If all categories are provided, validate sum
      if (weights.length === Object.keys(Category).length) {
        const sum = weights.reduce((acc, w) => acc + w.weight, 0);

        if (!validateWeightsSum(sum)) {
          throw new Error(
            `When all categories are provided, weights must sum to 1.0 (100%). Current sum: ${sum.toFixed(4)}`
          );
        }
      }

      return true;
    })
    .withMessage('Invalid weights configuration'),
];
