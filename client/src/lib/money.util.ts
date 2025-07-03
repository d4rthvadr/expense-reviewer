import { Currency } from "@/constants/currency.enum";

export const formatCurrency = (value: string | number, currency: string) => {
  const allowedCurrencies = Object.values(Currency);

  const toCurrency = allowedCurrencies.includes(currency as Currency)
    ? currency
    : Currency.USD;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: toCurrency,
  }).format(Number(value));
};
