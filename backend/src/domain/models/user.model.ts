import { v4 as uuidv4 } from 'uuid';

interface UserInput {
  id?: string;
  name?: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  readonly #id: string;
  #name?: string;
  #email: string;
  #password: string;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(data: UserInput) {
    const {
      id = uuidv4(),
      name,
      email,
      password,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = data;
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#password = password;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string | undefined {
    return this.#name;
  }

  set name(value: string | undefined) {
    this.#name = value;
    this.#updatedAt = new Date();
  }

  get email(): string {
    return this.#email;
  }

  set email(value: string) {
    this.#email = value;
    this.#updatedAt = new Date();
  }

  get password(): string {
    return this.#password;
  }

  set password(value: string) {
    this.#password = value;
    this.#updatedAt = new Date();
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }
}
