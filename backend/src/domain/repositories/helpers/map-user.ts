import { UserModel } from '../../models/user.model';
import { User as UserEntity } from '../../../../generated/prisma';
import { convertNullToUndefined } from './utils';

export function mapUser(entity: UserEntity): UserModel;
export function mapUser(entity: null): null;
export function mapUser(entity: UserEntity | null): UserModel | null;
export function mapUser(entity: UserEntity | null): UserModel | null {
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
