import { mapUser } from './helpers/map-user';
import { User as UserEntity } from '../../../generated/prisma';
import { UserModel } from '@domain/models/user.model';
import { Database } from '../../db/database';
import { log } from '@libs/logger';

export class UserRepository extends Database {
  constructor() {
    super();
  }

  async findOne(userId: string): Promise<UserModel | null> {
    try {
      const user: UserEntity | null = await this.user.findUnique({
        where: { id: userId },
      });

      return mapUser(user);
    } catch (error) {
      log.error({
        message: 'An error occurred while finding user:',
        error,
        code: 'USER_FIND_ERROR',
      });

      throw error;
    }
  }

  async save(data: UserModel): Promise<UserModel> {
    try {
      const user: UserEntity = await this.user.upsert({
        where: {
          id: data.id,
        },
        create: {
          id: data.id,
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

      return mapUser(user);
    } catch (error) {
      log.error({
        message: 'An error occurred while saving user:',
        error,
        code: 'USER_SAVE_ERROR',
      });

      throw error;
    }
  }
}
