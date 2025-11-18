import Express from 'express';
import { asyncHandler } from './utils/async-handler';
import { validateRequest } from '../middlewares/utils/validators/validate-request';
import { updateCategoryWeightsValidators } from '@api/middlewares/utils/validators';
import { categoryWeightController } from '@api/controllers/category-weight.controller';

const route = Express.Router();

/**
 * @swagger
 * /api/preferences/category-weights:
 *   get:
 *     summary: Get user's effective category weights
 *     description: Returns the effective category weights for the authenticated user, merging system defaults with user overrides. The `isCustom` field indicates whether a weight has been customized by the user.
 *     tags:
 *       - Preferences
 *     responses:
 *       200:
 *         description: Successfully retrieved category weights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         enum: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, MISCELLANEOUS, PERSONAL_AND_LIFESTYLE, TRAVEL, GIFTS_OR_DONATIONS, HOUSING, SAVINGS_OR_INVESTMENTS, INSURANCE, OTHER]
 *                       weight:
 *                         type: number
 *                         format: float
 *                         minimum: 0
 *                         maximum: 1
 *                         description: Weight as decimal (0.3 = 30%)
 *                       isCustom:
 *                         type: boolean
 *                         description: Whether this weight has been customized by the user
 *                 totalCategories:
 *                   type: integer
 *                   description: Total number of categories
 *                 customCount:
 *                   type: integer
 *                   description: Number of categories with custom weights
 *             example:
 *               weights:
 *                 - category: "HOUSING"
 *                   weight: 0.35
 *                   isCustom: true
 *                 - category: "FOOD"
 *                   weight: 0.15
 *                   isCustom: false
 *                 - category: "TRANSPORT"
 *                   weight: 0.12
 *                   isCustom: false
 *               totalCategories: 15
 *               customCount: 1
 *       401:
 *         description: Unauthorized - authentication required
 */
route.get('/', asyncHandler(categoryWeightController.getCategoryWeights));

/**
 * @swagger
 * /api/preferences/category-weights:
 *   patch:
 *     summary: Update user's category weight preferences
 *     description: Updates category weights for the authenticated user. Supports partial updates - only provided categories will be modified. If all 15 categories are provided, their weights must sum to 1.0 (100%).
 *     tags:
 *       - Preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weights
 *             properties:
 *               weights:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - category
 *                     - weight
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, MISCELLANEOUS, PERSONAL_AND_LIFESTYLE, TRAVEL, GIFTS_OR_DONATIONS, HOUSING, SAVINGS_OR_INVESTMENTS, INSURANCE, OTHER]
 *                     weight:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       maximum: 1
 *                       description: Weight as decimal (0.3 = 30%)
 *           examples:
 *             partial_update:
 *               summary: Update specific categories
 *               value:
 *                 weights:
 *                   - category: "HOUSING"
 *                     weight: 0.35
 *                   - category: "FOOD"
 *                     weight: 0.20
 *             full_update:
 *               summary: Update all categories (must sum to 1.0)
 *               value:
 *                 weights:
 *                   - category: "HOUSING"
 *                     weight: 0.30
 *                   - category: "FOOD"
 *                     weight: 0.15
 *                   - category: "TRANSPORT"
 *                     weight: 0.12
 *                   - category: "UTILITIES"
 *                     weight: 0.08
 *                   - category: "HEALTH"
 *                     weight: 0.05
 *                   - category: "SAVINGS_OR_INVESTMENTS"
 *                     weight: 0.10
 *                   - category: "ENTERTAINMENT"
 *                     weight: 0.05
 *                   - category: "SHOPPING"
 *                     weight: 0.05
 *                   - category: "EDUCATION"
 *                     weight: 0.03
 *                   - category: "PERSONAL_AND_LIFESTYLE"
 *                     weight: 0.03
 *                   - category: "TRAVEL"
 *                     weight: 0.02
 *                   - category: "GIFTS_OR_DONATIONS"
 *                     weight: 0.01
 *                   - category: "INSURANCE"
 *                     weight: 0.005
 *                   - category: "MISCELLANEOUS"
 *                     weight: 0.0025
 *                   - category: "OTHER"
 *                     weight: 0.0025
 *     responses:
 *       200:
 *         description: Weights updated successfully, returns all effective weights
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/GetCategoryWeightsResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               duplicate_categories:
 *                 summary: Duplicate categories in request
 *                 value:
 *                   message: "Duplicate categories are not allowed"
 *               invalid_sum:
 *                 summary: Weights don't sum to 1.0 when all provided
 *                 value:
 *                   message: "When all categories are provided, weights must sum to 1.0 (100%). Current sum: 0.9500"
 *               invalid_weight_range:
 *                 summary: Weight out of valid range
 *                 value:
 *                   message: "Weight must be a number between 0 and 1 (inclusive)"
 *       401:
 *         description: Unauthorized - authentication required
 */
route.patch(
  '/',
  updateCategoryWeightsValidators,
  validateRequest,
  asyncHandler(categoryWeightController.updateCategoryWeights)
);

export default route;
