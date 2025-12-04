import { log } from '@infra/logger';
import { userService, UserService } from '../../domain/services/user.service';
import {
  categoryWeightService,
  CategoryWeightService,
} from '../../domain/services/category-weight.service';
import { Request, Response } from 'express';
import { CreateUserRequestDto } from './dtos/request/create-user-request.dto';
import { RequestBodyType } from '../types/request-body.type';

export class UserController {
  #userService: UserService;
  #categoryWeightService: CategoryWeightService;

  constructor(
    userService: UserService,
    categoryWeightService: CategoryWeightService
  ) {
    this.#userService = userService;
    this.#categoryWeightService = categoryWeightService;
  }

  create = async (
    req: RequestBodyType<CreateUserRequestDto>,
    res: Response
  ) => {
    log.info(
      `Creating user with data: ${JSON.stringify({ name: req.body.name, email: req.body.email })}`
    );

    const user = await this.#userService.create(req.body);

    return res.status(201).json(user);
  };

  findOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.#userService.findById(id);

    res.status(200).json(user);
  };

  markWelcomeSeen = async (req: Request, res: Response) => {
    const userId = req.user.id;
    log.info(`Marking welcome as seen for user: ${userId}`);

    await this.#userService.markWelcomeSeen(userId);

    res.status(200).json({ success: true });
  };

  getOnboardingStatus = async (req: Request, res: Response) => {
    const userId = req.user.id;
    log.info(`Fetching onboarding status for user: ${userId}`);

    const user = await this.#userService.findById(userId);
    const hasCustomizedCategoryWeights =
      await this.#categoryWeightService.hasUserCustomizedWeights(userId);

    res.status(200).json({
      hasSeenWelcome: user?.hasSeenWelcome || false,
      hasCustomizedCategoryWeights,
    });
  };
}

export const userController = new UserController(
  userService,
  categoryWeightService
);
