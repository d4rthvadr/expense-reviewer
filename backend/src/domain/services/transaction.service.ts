import { TransactionRepository } from '@domain/repositories/transaction.repository';
import { log } from '@infra/logger';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { TransactionFactory } from '@domain/factories/transaction.factory';
import { TransactionResponseDto } from '../../api/controllers/dtos/response/transaction-response.dto';
import { ResourceNotFoundException } from '@domain/exceptions/resource-not-found.exception';
import { PaginatedResultDto } from '../../api/controllers/dtos/response/paginated-response.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { QueryParams } from './interfaces/query-params';
import {
  CurrencyConversionService,
  currencyConversionService,
} from '@domain/services/currency-conversion.service';
import { Currency } from '@domain/enum/currency.enum';
import { TransactionModel } from '@domain/models/transaction.model';
import { paginateDataResult } from '@api/controllers/utils/paginate-response';
import { TransactionFindFilters } from './interfaces/transaction-filters';

class TransactionService {
  #transactionRepository: TransactionRepository;
  #currencyConversionService: CurrencyConversionService;

  constructor(
    transactionRepository: TransactionRepository,
    currencyConversionService: CurrencyConversionService
  ) {
    this.#transactionRepository = transactionRepository;
    this.#currencyConversionService = currencyConversionService;
  }

  /**
   * Retrieves a paginated list of transactions based on the provided query parameters.
   *
   * @param query - The query parameters used to filter, sort, and paginate the transactions.
   * @returns A promise that resolves to a paginated result containing transaction response DTOs.
   */
  async find(
    query: QueryParams<TransactionFindFilters>,
    userId: string
  ): Promise<PaginatedResultDto<TransactionResponseDto>> {
    const { data, total } = await this.#transactionRepository.find(
      query,
      userId
    );

    return paginateDataResult(
      data.map((transaction) => this.#toTransactionDto(transaction)),
      total,
      query.limit,
      query.offset
    );
  }

  /**
   * Retrieves a transaction by its unique identifier.
   *
   * @param transactionId - The unique identifier of the transaction to retrieve.
   * @returns A promise that resolves to the found {@link TransactionModel}.
   * @throws {ResourceNotFoundException} If no transaction is found with the given ID.
   */
  private async findById(
    transactionId: string,
    userId: string
  ): Promise<TransactionModel> {
    log.info(`Finding transaction by id: ${transactionId}`);

    const transaction: TransactionModel | null =
      await this.#transactionRepository.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      log.error(
        `Transaction not found with id: ${transactionId} and userId: ${userId}`
      );
      throw new ResourceNotFoundException(
        `Transaction not found with id: ${transactionId}`
      );
    }

    return transaction;
  }

  /**
   * Retrieves a single transaction by its unique identifier.
   *
   * @param transactionId - The unique identifier of the transaction to retrieve.
   * @returns A promise that resolves to a `TransactionResponseDto` representing the found transaction.
   * @throws {NotFoundException} If no transaction is found with the provided ID.
   */
  async findOne(
    transactionId: string,
    userId: string
  ): Promise<TransactionResponseDto> {
    const transaction: TransactionModel = await this.findById(
      transactionId,
      userId
    );

    return this.#toTransactionDto(transaction);
  }

  /**
   * Creates a new transaction record using the provided data.
   *
   * @param data - The data required to create a new transaction.
   * @returns A promise that resolves to a `TransactionResponseDto` representing the newly created transaction.
   */
  async create(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    log.info(`Creating transaction: ${JSON.stringify(data)}`);

    const conversion = await this.#currencyConversionService.convertCurrency(
      data.amount,
      data.currency ?? Currency.USD,
      Currency.USD
    );

    const transaction = TransactionFactory.createTransaction({
      ...data,
      amountUsd: conversion.convertedAmount,
    });

    const createdTransaction =
      await this.#transactionRepository.save(transaction);

    return this.#toTransactionDto(createdTransaction);
  }

  /**
   * Updates an existing transaction with the provided data.
   *
   * @param transactionId - The unique identifier of the transaction to update.
   * @param data - The updated data for the transaction.
   * @returns A promise that resolves to a `TransactionResponseDto` representing the updated transaction.
   * @throws {ResourceNotFoundException} If the transaction with the given ID is not found.
   */
  async update(
    transactionId: string,
    userId: string,
    data: UpdateTransactionDto
  ): Promise<TransactionResponseDto> {
    log.info(`Updating transaction: ${transactionId}`);

    const existingTransaction = await this.findById(transactionId, userId);

    const conversion = await this.#currencyConversionService.convertCurrency(
      data.amount,
      data.currency ?? Currency.USD,
      Currency.USD
    );

    // Update transaction properties
    existingTransaction.name = data.name;
    existingTransaction.description = data.description;
    existingTransaction.amount = data.amount;
    existingTransaction.amountUsd = conversion.convertedAmount;
    existingTransaction.category = data.category;
    existingTransaction.currency = data.currency;
    existingTransaction.type = data.type;
    if (data.qty) {
      existingTransaction.qty = data.qty;
    }

    const updatedTransaction =
      await this.#transactionRepository.save(existingTransaction);

    return this.#toTransactionDto(updatedTransaction);
  }

  /**
   * Deletes a transaction with the specified ID.
   *
   * @param transactionId - The unique identifier of the transaction to delete.
   * @throws {ResourceNotFoundException} If the transaction with the given ID is not found.
   */
  async delete(transactionId: string, userId: string): Promise<void> {
    log.info(`Deleting transaction: ${transactionId}`);

    await this.findById(transactionId, userId);
    await this.#transactionRepository.delete(transactionId);

    log.info(`Transaction deleted successfully: ${transactionId}`);
  }

  /**
   * Converts a TransactionModel to a TransactionResponseDto.
   *
   * @param transaction - The transaction model to convert.
   * @returns The converted transaction response DTO.
   */
  #toTransactionDto(transaction: TransactionModel): TransactionResponseDto {
    return {
      id: transaction.id,
      name: transaction.name!,
      description: transaction.description,
      amount: transaction.amount,
      amountUsd: transaction.amountUsd,
      category: transaction.category,
      currency: transaction.currency,
      type: transaction.type,
      userId: transaction.userId,
      qty: transaction.qty,
      createdAt: transaction.createdAt,
    };
  }
}

// Create singleton instance
const transactionService = new TransactionService(
  new TransactionRepository(),
  currencyConversionService
);

export { transactionService, TransactionService };
