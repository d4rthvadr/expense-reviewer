import { UserModel } from '../../domain/models/user.model';

interface UserCreateDto {
  name?: string;
  email: string;
  password: string;
}
export class UserFactory {
  static createUser(data: UserCreateDto): UserModel {
    const { name, email, password } = data;

    const user = new UserModel({
      name,
      email,
      password,
    });

    console.log('User created:', user);
    return user;
  }
}
