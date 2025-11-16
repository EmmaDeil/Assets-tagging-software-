/**
 * Currency Configuration
 * 
 * Provides currency utilities for the application.
 * The default currency is fetched from app settings and used throughout the app.
 */

import API_BASE_URL from './api';

// Currency symbols map
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  SGD: 'S$',
  NZD: 'NZ$',
  ZAR: 'R',
  BRL: 'R$',
  MXN: '$',
  AED: 'د.إ',
  SAR: '﷼',
  KRW: '₩',
  HKD: 'HK$',
  SEK: 'kr',
  NOK: 'kr'
};

// Currency names map
export const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SGD: 'Singapore Dollar',
  NZD: 'New Zealand Dollar',
  ZAR: 'South African Rand',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  KRW: 'South Korean Won',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone'
};

let cachedCurrency = null;
let lastFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get the default currency from app settings
 * @returns {Promise<string>} Currency code (e.g., 'USD', 'EUR')
 */
export async function getDefaultCurrency() {
  // Return cached currency if still valid
  if (cachedCurrency && lastFetch && (Date.now() - lastFetch < CACHE_DURATION)) {
    return cachedCurrency;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    
    const data = await response.json();
    cachedCurrency = data.defaultCurrency || 'USD';
    lastFetch = Date.now();
    
    return cachedCurrency;
  } catch (error) {
    console.error('Error fetching default currency:', error);
    return 'USD'; // Fallback to USD
  }
}

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {string} Currency symbol (e.g., '$')
 */
export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Get currency name for a given currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {string} Currency name (e.g., 'US Dollar')
 */
export function getCurrencyName(currencyCode) {
  return CURRENCY_NAMES[currencyCode] || currencyCode;
}

/**
 * Format amount with currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {string} Formatted amount (e.g., '$1,234.56')
 */
export function formatCurrency(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Some currencies have symbol after amount
  if (['SEK', 'NOK'].includes(currencyCode)) {
    return `${formattedAmount} ${symbol}`;
  }
  
  return `${symbol}${formattedAmount}`;
}

/**
 * Clear currency cache (useful when settings are updated)
 */
export function clearCurrencyCache() {
  cachedCurrency = null;
  lastFetch = null;
}
