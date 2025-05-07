import { UserService } from '../domain/services/user.service';
import { Request, Response } from 'express';

// Dtos

interface CreateUserInputDto {
  name?: string;
  email: string;
  password: string;
}

type RequestBodyType<T> = Request<unknown, unknown, T>;

export class UserController {
  #userService: UserService;
  constructor(userService: UserService) {
    this.#userService = userService;
  }

  create = async (req: RequestBodyType<CreateUserInputDto>, res: Response) => {
    const { name, email, password } = req.body;
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
