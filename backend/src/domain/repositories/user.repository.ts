import { mapUser } from './helpers/map-user';
import { User as UserEntity, Prisma } from '../../../generated/prisma';
import { UserModel } from '@domain/models/user.model';
import { log } from '@infra/logger';
import { Database } from '@infra/db/database';

export class UserRepository extends Database {
  constructor() {
    super();
  }

  async find(data: Prisma.UserFindManyArgs = {}): Promise<UserModel[]> {
    log.info(`Finding users with data: ${JSON.stringify(data)}`);
    try {
      const users: UserEntity[] = await this.user.findMany({
        // where: data.where,
        ...data,
      });
      return users.map((user) => mapUser(user));
    } catch (error) {
      log.error({
        message: 'An error occurred while finding users:',
        error,
        code: 'USER_FIND_ERROR',
      });
      throw error;
    }
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param userId - The unique identifier of the user to find.
   * @returns A promise that resolves to the found user model or `null` if no user is found.
   * @throws Will throw an error if the database query fails.
   */
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

  /**
   * Saves a user to the database. If a user with the given ID exists, updates their information;
   * otherwise, creates a new user record.
   *
   * @param data - The user data to save, represented as a UserModel.
   * @returns A promise that resolves to the saved UserModel.
   * @throws Will throw an error if the save operation fails.
   */
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
          status: data.status,
          currency: data.currency,
          password: data.password,
          lastRecurSync: data.lastRecurSync,
          lastLogin: data.lastLogin,
        },
        update: {
          name: data.name,
          email: data.email,
          status: data.status,
          currency: data.currency,
          password: data.password,
          lastRecurSync: data.lastRecurSync,
          lastLogin: data.lastLogin,
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

  /**
   * Updates the last login timestamp for a user with the specified user ID.
   *
   * @param userId - The unique identifier of the user whose last login time should be updated.
   * @returns A promise that resolves to the updated UserModel object, or null if the user was not found.
   * @throws Will throw an error if the update operation fails.
   */
  async updateLastLogin(
    userId: string,
    lastActiveAt: Date
  ): Promise<UserModel | null> {
    try {
      const user: UserEntity | null = await this.user.update({
        where: { id: userId },
        data: { lastLogin: lastActiveAt },
      });

      return mapUser(user);
    } catch (error) {
      log.error({
        message: 'An error occurred while updating user lastLogin:',
        error,
        code: 'USER_UPDATE_LAST_LOGIN_ERROR',
      });

      throw error;
    }
  }
}

const userRepository = new UserRepository();
export { userRepository };
