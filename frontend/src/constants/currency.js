/**
 * Global Currency Configuration
 * Change the currency settings here to update across the entire application
 */

export const CURRENCY = {
    // Currency name
    name: 'Kenya Shillings',
    
    // Currency code (ISO 4217)
    code: 'KES',
    
    // Currency symbol
    symbol: 'KSh',
    
    // Symbol position: 'before' or 'after'
    symbolPosition: 'before',
    
    // Locale for number formatting (en-KE for Kenya)
    locale: 'en-KE',
    
    // Decimal places
    decimalPlaces: 2,
    
    // Whether to show decimal places for whole numbers
    showDecimalsForWholeNumbers: false
};

/**
 * Format a number as currency
 * @param {number|string} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
    const {
        showSymbol = true,
        showDecimals = true,
        customSymbol = null,
        customLocale = null
    } = options;

    const numAmount = parseFloat(amount) || 0;
    const symbol = customSymbol || CURRENCY.symbol;
    const locale = customLocale || CURRENCY.locale;
    
    // Format number
    const formatted = numAmount.toLocaleString(locale, {
        minimumFractionDigits: showDecimals ? CURRENCY.decimalPlaces : 0,
        maximumFractionDigits: showDecimals ? CURRENCY.decimalPlaces : 0
    });

    // Add symbol
    if (showSymbol) {
        if (CURRENCY.symbolPosition === 'before') {
            return `${symbol}${formatted}`;
        } else {
            return `${formatted} ${symbol}`;
        }
    }
    
    return formatted;
};

/**
 * Format currency with sign (for income/expense)
 * @param {number|string} amount - The amount to format
 * @param {string} type - 'income' or 'expense' or 'Income' or 'Expense'
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string with sign
 */
export const formatCurrencyWithSign = (amount, type, options = {}) => {
    const numAmount = parseFloat(amount) || 0;
    const isIncome = type?.toLowerCase() === 'income';
    const sign = isIncome ? '+' : '-';
    const formatted = formatCurrency(Math.abs(numAmount), options);
    return `${sign}${formatted}`;
};
