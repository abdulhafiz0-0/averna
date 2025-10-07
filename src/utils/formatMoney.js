/**
 * Format money value by adding spaces as thousand separators
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount with spaces (e.g., 300000 -> "300 000")
 */
export const formatMoney = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with spaces as thousand separators
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  }).replace(/,/g, ' ');
};

/**
 * Format money value with SOM currency for Uzbekistan
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount with SOM currency (e.g., 300000 -> "300 000 SOM")
 */
export const formatMoneyWithSom = (amount) => {
  return `${formatMoney(amount)} UZS`;
};

/**
 * Format money value with currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: 'SOM')
 * @returns {string} - Formatted amount with currency
 */
export const formatMoneyWithCurrency = (amount, currency = 'UZS') => {
  return `${formatMoney(amount)} ${currency}`;
};
