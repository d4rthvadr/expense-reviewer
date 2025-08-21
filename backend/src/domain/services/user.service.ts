import {
  userRepository,
  UserRepository,
} from '@domain/repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserModel } from '@domain/models/user.model';
import { UserFactory } from '@domain/factories/user.factory';
import { log } from '@infra/logger';
import { UserResponseDto } from '../../api/controllers/dtos/response/user-response.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { v4 as uuidv4 } from 'uuid';

export interface CreateFromClerkDto {
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export class UserService {
  #userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository;
  }

  /**
   * Generates a random password using UUID
   * @returns Random password string based on UUID
   */
  private generateRandomPassword(): string {
    // Generate a UUID and remove hyphens to create a password
    return uuidv4().replace(/-/g, '');
  }

  async findById(userId: string): Promise<UserResponseDto | undefined> {
    log.info(`Finding user by id: ${userId}`);

    const user: UserModel | null = await this.#userRepository.findOne(userId);
    if (!user) {
      log.error(`User not found with id: ${userId}`);
      throw new ResourceNotFoundException(`User not found with id: ${userId}`);
    }

    return this.#toUserCreatedDto(user);
  }

  async findByClerkId(clerkId: string): Promise<UserResponseDto | null> {
    log.info(`Finding user by Clerk ID: ${clerkId}`);

    // For now, we'll use the existing methods to find the user
    // You might need to add a findByClerkId method to the repository later
    try {
      const user = await this.#userRepository.findOne(clerkId);
      if (!user) {
        log.info(`User not found with Clerk ID: ${clerkId}`);
        return null;
      }

      return this.#toUserCreatedDto(user);
    } catch (error) {
      log.error(`Error finding user by Clerk ID: ${error}`);
      return null;
    }
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const userModel = UserFactory.createUser(data);

    const user = await this.#userRepository.save(userModel);

    log.info(`User created: ${JSON.stringify({ email: user.email })}`);

    return this.#toUserCreatedDto(user);
  }

  /**
   * Creates a new user in the system based on data received from Clerk authentication.
   *
   * This method checks if a user with the provided Clerk ID already exists. If so, it returns the existing user.
   * Otherwise, it creates a new user using the provided Clerk data, assigns a random password (since authentication is managed by Clerk),
   * and sets the Clerk ID as the user's unique identifier.
   *
   * @param data - The user data received from Clerk, including first name, last name, and email.
   * @param clerkId - The unique identifier assigned to the user by Clerk.
   * @returns A promise that resolves to a UserResponseDto representing the created or existing user.
   */
  async createFromClerk(
    data: CreateFromClerkDto,
    clerkId: string
  ): Promise<UserResponseDto> {
    log.info(`Creating user from Clerk signup: ${data.email}`);

    // Check if user already exists
    const existingUser = await this.findByClerkId(clerkId);
    if (existingUser) {
      log.info(`User already exists with Clerk ID: ${clerkId}`);
      return existingUser;
    }

    const randomPassword = `clerk_managed_${this.generateRandomPassword()}`; // Clerk manages authentication, so password is not needed
    // Create user data from Clerk info
    const userData: CreateUserDto = {
      name:
        [data.firstName, data.lastName].filter(Boolean).join(' ') ||
        data.email.split('@')[0],
      email: data.email,
      password: randomPassword,
    };

    const userModel = UserFactory.createUser(userData);

    // Set the Clerk ID as the unique identifier for the user
    userModel.id = clerkId;

    // TODO: Check for existing user with the same email or Clerk ID
    // Or let prisma handle it with unique constraint

    const user = await this.#userRepository.save(userModel);

    log.info(
      `User created from Clerk: ${JSON.stringify({ email: user.email, clerkId })}`
    );

    return this.#toUserCreatedDto(user);
  }

  /**
   * Updates the last login timestamp for a user identified by the given Clerk ID.
   *
   * Logs the update process and handles cases where the user is not found.
   * Returns the updated user data as a `UserResponseDto` if successful, or `null` if the user does not exist.
   * Throws an error if the update operation fails.
   *
   * @param clerkId - The Clerk ID of the user whose last login timestamp should be updated.
   * @returns A promise that resolves to the updated `UserResponseDto` or `null` if the user is not found.
   * @throws Will throw an error if the update operation encounters an issue.
   */
  async updateLastLogin(
    clerkId: string,
    lastActiveAt?: number
  ): Promise<UserResponseDto | null> {
    log.info(`Updating last login for user with Clerk ID: ${clerkId}`);

    try {
      const lastActiveAtDate = lastActiveAt
        ? new Date(lastActiveAt)
        : new Date();

      const user = await this.#userRepository.updateLastLogin(
        clerkId,
        lastActiveAtDate
      );
      if (!user) {
        log.warn(`User not found with Clerk ID: ${clerkId}`);
        return null;
      }

      log.info(
        `Successfully updated last login for user with Clerk ID: ${clerkId}`
      );
      return this.#toUserCreatedDto(user);
    } catch (error) {
      log.error(
        `Error updating last login for user with Clerk ID ${clerkId}: ${error}`
      );
      throw error;
    }
  }

  #toUserCreatedDto({
    id,
    name,
    email,
    status,
    createdAt,
  }: UserModel): UserResponseDto {
    return {
      id,
      name,
      email,
      status,
      createdAt,
    };
  }
}

export const userService = new UserService(userRepository);
