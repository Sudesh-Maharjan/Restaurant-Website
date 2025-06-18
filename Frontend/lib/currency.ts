/**
 * Format a price according to the selected currency
 * 
 * @param price - The price to format
 * @param currency - The currency code: USD, GBP, or NPR
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  switch (currency) {
    case 'USD':
      return `$${price.toFixed(2)}`;
    case 'GBP':
      return `£${price.toFixed(2)}`;
    case 'NPR':
      return `₨ ${price.toFixed(2)}`;
    default:
      return `$${price.toFixed(2)}`;
  }
};

/**
 * Get currency symbol from currency code
 * 
 * @param currency - The currency code: USD, GBP, or NPR
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    case 'NPR':
      return '₨';
    default:
      return '$';
  }
};

/**
 * Convert price from one currency to another
 * Note: This is a simplified conversion - in a real app, you would use an API
 * 
 * @param price - The price to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted price
 */
export const convertCurrency = (
  price: number, 
  fromCurrency: string = 'USD', 
  toCurrency: string = 'USD'
): number => {
  // Example conversion rates (as of June 2025)
  const rates = {
    USD: { USD: 1, GBP: 0.78, NPR: 132.5 },
    GBP: { USD: 1.28, GBP: 1, NPR: 170 },
    NPR: { USD: 0.0075, GBP: 0.0059, NPR: 1 }
  };
  
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) return price;
  
  // Convert from source to target currency
  return price * rates[fromCurrency as keyof typeof rates][toCurrency as keyof typeof rates['USD']];
};
