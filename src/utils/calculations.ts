import { QuantityConversion } from '../types';

export const quantityConversions: QuantityConversion[] = [
  { name: 'paiya', grams: 120, displayName: 'Paiya (120g)' },
  { name: 'adhPa', grams: 250, displayName: 'Adh Pa (250g)' },
  { name: 'adhaKilo', grams: 500, displayName: 'Adha Kilo (500g)' },
  { name: 'kilo', grams: 1000, displayName: 'Kilo (1000g)' }
];

export const calculatePriceForQuantity = (pricePerKg: number, grams: number): number => {
  return Math.round((pricePerKg * grams / 1000) * 100) / 100;
};

export const calculateQuantityForPrice = (pricePerKg: number, targetPrice: number): number => {
  return Math.round((targetPrice / pricePerKg) * 1000) / 1000;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatQuantity = (quantity: number, type: 'units' | 'kg'): string => {
  if (type === 'units') {
    return `${quantity} units`;
  }
  return quantity >= 1 ? `${quantity}kg` : `${quantity * 1000}g`;
};

export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};