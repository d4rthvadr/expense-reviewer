import { UserModel } from '../../models/user.model';
import { User as UserEntity } from '../../../../generated/prisma';
import { convertNullToUndefined } from './utils';

export function mapToUser(entity: UserEntity): UserModel;
export function mapToUser(entity: null): null;
export function mapToUser(entity: UserEntity | null): UserModel | null;
export function mapToUser(entity: UserEntity | null): UserModel | null {
  if (!entity) {
    return null;
  }

  return new UserModel({
    id: entity.id,
    name: convertNullToUndefined(entity.name),
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    password: entity.password,
  });
}
