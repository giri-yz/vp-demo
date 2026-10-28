export interface CountryConfig {
  id: string;
  name: string;
  code: string;
  flagImg: string;
  currency: string;
  currencySymbol: string;
  phoneCode: string;
  language: string;
  timezone: string;
  color: string;
  colorLight: string;
  tagline: string;
  paymentMethods: string[];
  languages: string[];
  timezones: string[];
  currencies: string[];
  adminPhone: string;
  adminIdPrefix: string;
}

export const countryConfigs: Record<string, CountryConfig> = {
  india: {
    id: 'india',
    name: 'India',
    code: 'IN',
    flagImg: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001490/vpnexues/old/site-assets/assets-ui/img/in-flag.svg',
    currency: 'INR',
    currencySymbol: '₹',
    phoneCode: '+91',
    language: 'Hindi, English',
    timezone: 'Asia/Kolkata',
    color: '#2E7D32',
    colorLight: '#E8F5E9',
    tagline: 'விவசாயம் காப்போம் • India',
    paymentMethods: ['UPI', 'Card', 'COD', 'Net Banking'],
    languages: ['English', 'Hindi', 'Bengali', 'Tamil'],
    timezones: ['Asia/Kolkata'],
    currencies: ['INR', 'USD'],
    adminPhone: '+91 98765 43210',
    adminIdPrefix: 'ADM-IN',
  },
  singapore: {
    id: 'singapore',
    name: 'Singapore',
    code: 'SG',
    flagImg: '/images/sg-flag.svg',
    currency: 'SGD',
    currencySymbol: 'S$',
    phoneCode: '+65',
    language: 'English, Malay',
    timezone: 'Asia/Singapore',
    color: '#4DA6E1',
    colorLight: '#E3F2FD',
    tagline: 'Fresh From Farm • Singapore',
    paymentMethods: ['PayNow', 'Card', 'GrabPay', 'COD'],
    languages: ['English', 'Chinese', 'Malay', 'Tamil'],
    timezones: ['Asia/Singapore'],
    currencies: ['SGD', 'USD'],
    adminPhone: '+65 9000 1234',
    adminIdPrefix: 'ADM-SG',
  },
  uae: {
    id: 'uae',
    name: 'UAE',
    code: 'AE',
    flagImg: '/images/uae-flag.svg',
    currency: 'AED',
    currencySymbol: 'AED',
    phoneCode: '+971',
    language: 'Arabic, English',
    timezone: 'Asia/Dubai',
    color: '#7EBC51',
    colorLight: '#F1F8E9',
    tagline: 'Fresh From Farm • UAE',
    paymentMethods: ['Card', 'Apple Pay', 'COD'],
    languages: ['English', 'Arabic'],
    timezones: ['Asia/Dubai'],
    currencies: ['AED', 'USD'],
    adminPhone: '+971 50 000 1234',
    adminIdPrefix: 'ADM-AE',
  },
  us: {
    id: 'us',
    name: 'US',
    code: 'US',
    flagImg: '/images/us-flag.svg',
    currency: 'USD',
    currencySymbol: '$',
    phoneCode: '+1',
    language: 'English',
    timezone: 'America/New_York',
    color: '#E57373',
    colorLight: '#FFEBEE',
    tagline: 'We Support Farmers • US',
    paymentMethods: ['Card', 'Apple Pay', 'COD'],
    languages: ['English', 'Spanish', 'French', 'Chinese'],
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
    currencies: ['USD', 'EUR', 'GBP'],
    adminPhone: '+1 212 555 0100',
    adminIdPrefix: 'ADM-US',
  },
  lk: {
    id: 'lk',
    name: 'Sri Lanka',
    code: 'LK',
    flagImg: '/images/lk-flag.svg',
    currency: 'LKR',
    currencySymbol: 'Rs.',
    phoneCode: '+94',
    language: 'Sinhala, Tamil, English',
    timezone: 'Asia/Colombo',
    color: '#00534E',
    colorLight: '#E8F5E9',
    tagline: 'Fresh From Farm • Sri Lanka',
    paymentMethods: ['Card', 'Bank Transfer', 'COD'],
    languages: ['Sinhala', 'Tamil', 'English'],
    timezones: ['Asia/Colombo'],
    currencies: ['LKR', 'USD'],
    adminPhone: '+94 11 234 5678',
    adminIdPrefix: 'ADM-LK',
  },
};

export const getCountryConfig = (countryId: string): CountryConfig | undefined => {
  return countryConfigs[countryId.toLowerCase()];
};

export const getAllCountries = (): CountryConfig[] => {
  return Object.values(countryConfigs);
};
