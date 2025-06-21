import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { Product, Sale, Creditor, Expense, RestockItem, Payment } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    const data = db.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = db.addProduct(product);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = db.updateProduct(id, updates);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
    return updated;
  };

  const deleteProduct = (id: string) => {
    const success = db.deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    return success;
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  };
};

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setLoading(true);
    const data = db.getSales();
    setSales(data);
    setLoading(false);
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = db.addSale(sale);
    setSales(prev => [...prev, newSale]);
    return newSale;
  };

  return {
    sales,
    loading,
    addSale,
    refreshSales: loadSales
  };
};

export const useCreditors = () => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditors();
  }, []);

  const loadCreditors = () => {
    setLoading(true);
    const data = db.getCreditors();
    setCreditors(data);
    setLoading(false);
  };

  const clearDebt = (creditorId: string, amount: number) => {
    const success = db.clearDebt(creditorId, amount);
    if (success) {
      loadCreditors();
    }
    return success;
  };

  return {
    creditors,
    loading,
    clearDebt,
    refreshCreditors: loadCreditors
  };
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    setLoading(true);
    const data = db.getExpenses();
    setExpenses(data);
    setLoading(false);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = db.addExpense(expense);
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = db.updateExpense(id, updates);
    if (updated) {
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    }
    return updated;
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    refreshExpenses: loadExpenses
  };
};

export const useRestockItems = () => {
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestockItems();
  }, []);

  const loadRestockItems = () => {
    setLoading(true);
    const data = db.getRestockItems();
    setRestockItems(data);
    setLoading(false);
  };

  const addRestockItem = (item: Omit<RestockItem, 'id' | 'createdAt'>) => {
    const newItem = db.addRestockItem(item);
    setRestockItems(prev => [...prev, newItem]);
    return newItem;
  };

  const removeRestockItem = (id: string) => {
    const success = db.removeRestockItem(id);
    if (success) {
      setRestockItems(prev => prev.filter(item => item.id !== id));
    }
    return success;
  };

  const clearRestockList = () => {
    db.clearRestockList();
    setRestockItems([]);
  };

  const generateLowStockItems = () => {
    const items = db.generateLowStockItems();
    setRestockItems(items);
  };

  return {
    restockItems,
    loading,
    addRestockItem,
    removeRestockItem,
    clearRestockList,
    generateLowStockItems,
    refreshRestockItems: loadRestockItems
  };
};

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    setLoading(true);
    const data = db.getPayments();
    setPayments(data);
    setLoading(false);
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = db.addPayment(payment);
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    const updated = db.updatePayment(id, updates);
    if (updated) {
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
    }
    return updated;
  };

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    refreshPayments: loadPayments
  };
};