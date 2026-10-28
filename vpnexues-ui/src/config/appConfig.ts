export const APP_ENV = import.meta.env.VITE_APP_ENV || 'production';
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const IS_PRODUCTION = APP_ENV === 'production';

export const SESSION_TYPE = 'REAL'; // set by auth context only; never inferred from failure

export const RULES = {
  neverFallbackToDemo: true,
  realSessionOnly: IS_PRODUCTION && !DEMO_MODE,
};
