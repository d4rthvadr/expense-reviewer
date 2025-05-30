/* eslint-disable no-unused-vars */

import { UserModel } from '../../models/user.model';
import { User as UserEntity } from '../../../../generated/prisma';
import { convertNullToUndefined, convertToFamilyType } from './utils';
import { Currency } from '@domain/enum/currency.enum';

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
    currency: convertToFamilyType(
      convertNullToUndefined(entity.currency),
      Currency
    ),
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    password: entity.password,
  });
}
