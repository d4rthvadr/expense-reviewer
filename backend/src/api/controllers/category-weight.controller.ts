import { log } from '@infra/logger';
import { Request, Response } from 'express';
import {
  categoryWeightService,
  CategoryWeightService,
} from '@domain/services/category-weight.service';
import { UpdateCategoryWeightsRequestDto } from './dtos/request/update-category-weights-request.dto';

export class CategoryWeightController {
  #service: CategoryWeightService;

  constructor(service: CategoryWeightService) {
    this.#service = service;
  }

  /**
   * GET /api/preferences/category-weights
   * Get effective category weights for the authenticated user
   */
  getCategoryWeights = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;

    log.info(`Getting category weights for userId: ${userId}`);

    const response = await this.#service.getEffectiveWeightsDto(userId);

    res.status(200).json(response);
  };

  /**
   * PATCH /api/preferences/category-weights
   * Update user's category weight preferences (partial update supported)
   */
  updateCategoryWeights = async (
    req: Request<unknown, unknown, UpdateCategoryWeightsRequestDto, unknown>,
    res: Response
  ): Promise<void> => {
    const userId = req.user.id;
    const { weights } = req.body;

    log.info(
      `Updating ${weights.length} category weights for userId: ${userId}`
    );

    const response = await this.#service.updateUserWeights(userId, weights);

    res.status(200).json(response);
  };
}

export const categoryWeightController = new CategoryWeightController(
  categoryWeightService
);
