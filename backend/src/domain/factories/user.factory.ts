import { Currency } from '@domain/enum/currency.enum';
import { UserStatus } from '@domain/enum/user-status.enum';
import { UserModel } from '@domain/models/user.model';

interface UserCreateDto {
  name?: string;
  email: string;
  status?: UserStatus;
  currency?: Currency;
  password: string;
}
export class UserFactory {
  /**
   * Creates a new UserModel instance from the provided data.
   * @param data - The data to create the user model.
   * @returns A new UserModel instance.
   */
  static createUser(data: UserCreateDto): UserModel {
    const { name, email, password, currency, status } = data;

    const user: UserModel = new UserModel({
      name,
      email,
      status,
      password,
      currency,
    });

    return user;
  }
}
