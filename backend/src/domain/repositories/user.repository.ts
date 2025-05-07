import { mapToUser } from './helpers/map-user';
import { User as UserEntity } from '../../../generated/prisma';
import { UserModel } from '../../domain/models/user.model';
import { Database } from '../../db/database';

interface CreateUserInput {
  name?: string;
  email: string;
  password: string;
}

export class UserRepository extends Database {
  constructor() {
    super();
  }

  async findAll(): Promise<UserModel[]> {
    const users: UserEntity[] = await this.user.findMany();

    return users.map((user) => mapToUser(user));
  }
  async findOne(userId: string): Promise<UserModel | null> {
    const user: UserEntity | null = await this.user.findUnique({
      where: { id: userId },
    });
    return mapToUser(user);
  }

  async save(data: UserModel): Promise<UserModel> {
    try {
      const user: UserEntity = await this.user.upsert({
        where: {
          id: data.id,
        },
        create: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        update: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      return mapToUser(user);
    } catch (error) {
      console.log(`Failed to save user ${data.email}`, error);

      throw error;
    }
  }
}
