import { log } from '../libs/logger';
import { UserService } from '../domain/services/user.service';
import { Request, Response } from 'express';
import { CreateUserRequestDto } from './dtos/request/create-user-request.dto';
import { RequestBodyType } from '../types/request-body.type';

export class UserController {
  #userService: UserService;
  constructor(userService: UserService) {
    this.#userService = userService;
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
}
