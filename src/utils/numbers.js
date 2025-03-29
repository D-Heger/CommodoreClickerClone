import Decimal from 'decimal.js'

// Configure Decimal.js
Decimal.set({ precision: 20, rounding: 4 })

// Convert a number or string to Decimal
export const toDecimal = (value) => new Decimal(value)

// Format large numbers with appropriate suffixes
export const formatNumber = (value) => {
  const decimal = toDecimal(value)
  const suffixes = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc',
    'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'ODc',
    'Nd', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OVg',
    'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OTg', 'Qd',
    'UQd', 'DQd', 'TQd', 'QaQd', 'QiQd', 'SxQd', 'SpQd', 'OQd', 'Qq', 'UQq',
    'DQq', 'TQq', 'QaQq', 'QiQq', 'SxQq', 'SpQq', 'OQq', 'Sg'
  ]
  
  if (decimal.lessThan(1000)) {
    return decimal.toFixed(2).replace(/\.?0+$/, '')
  }

  // Handle extremely large numbers with scientific notation
  if (decimal.gte(Decimal.pow(1000, suffixes.length))) {
    return decimal.toExponential(2).replace(/\.?0+e/, 'e')
  }

  const exp = Math.floor(decimal.log(1000))
  const suffixIndex = Math.min(exp, suffixes.length - 1)
  
  const scaled = decimal.div(Decimal.pow(1000, suffixIndex))
  return scaled.toFixed(2).replace(/\.?0+$/, '') + suffixes[suffixIndex]
}

// Add two numbers precisely
export const add = (a, b) => toDecimal(a).plus(toDecimal(b))

// Multiply two numbers precisely
export const multiply = (a, b) => toDecimal(a).times(toDecimal(b))

// Check if one number is greater than or equal to another
export const gte = (a, b) => toDecimal(a).gte(toDecimal(b))

// Subtract two numbers precisely
export const subtract = (a, b) => toDecimal(a).minus(toDecimal(b))

// Power function for exponentiation
export const power = (a, b) => toDecimal(a).pow(toDecimal(b))