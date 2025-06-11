import { PrismaClient } from '../../../generated/prisma';

export class Database extends PrismaClient {
  constructor() {
    super();
  }
}

export const db = new Database();
