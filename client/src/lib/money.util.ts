import { Currency } from "@/constants/currency.enum";

const ALLOWED_CURRENCIES = Object.values(Currency);
export const formatCurrency = (value: string | number, currency: string) => {
  const toCurrency = ALLOWED_CURRENCIES.includes(currency as Currency)
    ? currency
    : Currency.USD;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: toCurrency,
  }).format(Number(value));
};
