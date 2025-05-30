import { Currency } from '@domain/enum/currency.enum';
import { UserModel } from '@domain/models/user.model';

interface UserCreateDto {
  name?: string;
  email: string;
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
    const { name, email, password, currency } = data;

    const user: UserModel = new UserModel({
      name,
      email,
      password,
      currency,
    });

    return user;
  }
}
