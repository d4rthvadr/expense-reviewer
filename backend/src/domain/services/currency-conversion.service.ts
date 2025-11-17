import { Currency } from '@domain/enum/currency.enum';
import { log } from '@infra/logger';

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  targetCurrency: Currency;
  exchangeRate: number;
  lastUpdated: Date;
}

// Mock exchange rates - in production, this would come from an external API
// like exchangerate-api.com, fixer.io, or similar service
const MOCK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1.0, // Base currency
  EUR: 0.85, // 1 USD = 0.85 EUR
  GHS: 12.0, // 1 USD = 12.0 GHS
};

export class CurrencyConversionService {
  private static readonly DEFAULT_BASE_CURRENCY = Currency.USD;

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<CurrencyConversionResult> {
    try {
      if (isNaN(amount) || amount < 0) {
        throw new Error(`Invalid amount for conversion: ${amount}`);
      }
      log.info(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);

      // If same currency, no conversion needed
      if (fromCurrency === toCurrency) {
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          targetCurrency: toCurrency,
          exchangeRate: 1.0,
          lastUpdated: new Date(),
        };
      }

      const fromRate = MOCK_EXCHANGE_RATES[fromCurrency];
      const toRate = MOCK_EXCHANGE_RATES[toCurrency];

      if (!fromRate || !toRate) {
        throw new Error(
          `Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`
        );
      }

      // Convert through USD as base currency
      // Formula: (amount / fromRate) * toRate
      const convertedAmount = (amount / fromRate) * toRate;
      const exchangeRate = toRate / fromRate;

      log.info(
        `Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency} (rate: ${exchangeRate.toFixed(4)})`
      );

      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
        targetCurrency: toCurrency,
        exchangeRate: Math.round(exchangeRate * 10000) / 10000, // Round to 4 decimal places
        lastUpdated: new Date(),
      };
    } catch (error) {
      log.error({
        message: `Error converting currency from ${fromCurrency} to ${toCurrency}`,
        error,
        code: 'CURRENCY_CONVERSION_ERROR',
      });
      throw error;
    }
  }

  /**
   * Convert multiple amounts to a base currency
   */
  async convertToBasisCurrency(
    amounts: Array<{ amount: number; currency: Currency }>,
    baseCurrency: Currency = CurrencyConversionService.DEFAULT_BASE_CURRENCY
  ): Promise<Array<CurrencyConversionResult>> {
    const conversions: Array<CurrencyConversionResult> = [];

    for (const { amount, currency } of amounts) {
      const conversion = await this.convertCurrency(
        amount,
        currency,
        baseCurrency
      );
      conversions.push(conversion);
    }

    return conversions;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return Object.values(Currency);
  }

  /**
   * Get default base currency for analytics
   */
  getDefaultBaseCurrency(): Currency {
    return CurrencyConversionService.DEFAULT_BASE_CURRENCY;
  }

  /**
   * In production, this method would fetch real-time exchange rates
   * from an external API and cache them
   */
  private async fetchExchangeRates(): Promise<ExchangeRates> {
    // TODO: Implement real exchange rate fetching
    // Example: Call to exchangerate-api.com or similar service
    // For now, return mock rates
    return MOCK_EXCHANGE_RATES;
  }
}

export const currencyConversionService = new CurrencyConversionService();
