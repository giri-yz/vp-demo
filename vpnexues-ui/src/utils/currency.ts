import type { CountryCode } from '../types';

const CURRENCY_SYMBOLS: Record<CountryCode, string> = {
  SG: 'S$',
  IN: '₹',
  US: '$',
  AE: 'AED ',
  LK: 'Rs.',
  MY: 'RM',
};

const CURRENCY_LOCALE: Record<CountryCode, string> = {
  SG: 'en-SG',
  IN: 'en-IN',
  US: 'en-US',
  AE: 'en-AE',
  LK: 'si-LK',
  MY: 'ms-MY',
};

const CURRENCY_DIGITS: Record<CountryCode, number> = {
  SG: 2,
  IN: 0,
  US: 2,
  AE: 2,
  LK: 2,
  MY: 2,
};

export function currencySymbol(country: CountryCode): string {
  return CURRENCY_SYMBOLS[country];
}

export function formatPrice(amount: number, country: CountryCode): string {
  const sym = CURRENCY_SYMBOLS[country];
  const locale = CURRENCY_LOCALE[country];
  const digits = CURRENCY_DIGITS[country];
  return sym + amount.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
