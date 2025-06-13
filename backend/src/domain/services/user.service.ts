import {
  userRepository,
  UserRepository,
} from '@domain/repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserModel } from '@domain/models/user.model';
import { UserFactory } from '@domain/factories/user.factory';
import { log } from '@infra/logger';
import { UserResponseDto } from '../../application/controllers/dtos/response/user-response.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';

export class UserService {
  #userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository;
  }

  async findById(userId: string): Promise<UserResponseDto | undefined> {
    log.info(`Finding user by id: ${userId}`);

    const user: UserModel | null = await this.#userRepository.findOne(userId);
    if (!user) {
      log.error(`User not found with id: ${userId}`);
      throw new ResourceNotFoundException(`User not found with id: ${userId}`);
    }

    return this.#toUserCreatedDto(user);
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const userModel = UserFactory.createUser(data);

    const user = await this.#userRepository.save(userModel);

    log.info(`User created: ${JSON.stringify({ email: user.email })}`);

    return this.#toUserCreatedDto(user);
  }

  #toUserCreatedDto({
    id,
    name,
    email,
    status,
    createdAt,
  }: UserModel): UserResponseDto {
    return {
      id,
      name,
      email,
      status,
      createdAt,
    };
  }
}

export const userService = new UserService(userRepository);
