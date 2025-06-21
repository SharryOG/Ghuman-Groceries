export interface Product {
  id: string;
  name: string;
  image?: string;
  salePrice: number;
  purchasePrice?: number;
  type: 'units' | 'kg';
  quantity: number;
  minQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  type: 'units' | 'kg';
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  buyerName?: string;
  paymentType: 'cash' | 'credit';
  date: Date;
  isPaid: boolean;
}

export interface Creditor {
  id: string;
  name: string;
  totalDebt: number;
  purchases: Sale[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  isPaid: boolean;
  paidAmount: number;
  date: Date;
  dueDate?: Date;
}

export interface RestockItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  isCustom: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  transactionCount: number;
}

export type TabType = 'home' | 'analytics' | 'inventory' | 'sales' | 'creditors';

export interface QuantityConversion {
  name: string;
  grams: number;
  displayName: string;
}