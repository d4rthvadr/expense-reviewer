import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModel } from '../../domain/models/user.model';
import { UserFactory } from '../../domain/factories/user.factory';

export class UserService {
  #userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository;
  }

  async findById(id: string): Promise<unknown> {
    return {
      id: id,
      name: 'John Doe',
      email: '',
    };
  }

  async create(data: CreateUserDto): Promise<UserModel> {
    console.log('Creating user with data:', data);
    const userModel = UserFactory.createUser(data);

    const user = await this.#userRepository.save(userModel);

    console.log('User created:', { n: user.name, e: user.email });

    return user;
  }
}
