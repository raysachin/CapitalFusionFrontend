// utils/currencyConverter.ts

export const convertCurrency = (valueInINR: number, targetCurrency: string): number => {
  const conversionRates: Record<string, number> = {
    INR: 1,
    USD: 1 / 83.2,
    EUR: 1 / 91.2,
    GBP: 1 / 106.7,
    JPY: 1 / 0.56,
  };

  return valueInINR * (conversionRates[targetCurrency] || 1);
};
