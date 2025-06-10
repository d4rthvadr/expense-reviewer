import { UserStatus } from '@domain/enum/user-status.enum';

export interface CreateUserDto {
  name?: string;
  email: string;
  status?: UserStatus;
  password: string;
}
