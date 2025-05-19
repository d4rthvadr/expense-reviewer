import { log } from '../libs/logger';
import { UserService } from '../domain/services/user.service';
import { Request, Response } from 'express';
import { CreateUserRequestDto } from './dtos/request/create-user-request.dto';
import { RequestBodyType } from '../types/request-body.type';
import { json } from 'stream/consumers';

export class UserController {
  #userService: UserService;
  constructor(userService: UserService) {
    this.#userService = userService;
  }

  create = async (
    req: RequestBodyType<CreateUserRequestDto>,
    res: Response
  ) => {
    const { name, email, password } = req.body;

    log.info(
      `Creating user with data: ${JSON.stringify({ name, email, password })}`
    );

    const user = await this.#userService.create({
      name,
      email,
      password,
    });

    return res.status(201).json(user);
  };

  findOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.#userService.findById(id);

    res.status(200).json(user);
  };
}
