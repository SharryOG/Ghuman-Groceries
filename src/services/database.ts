import initSqlJs from 'sql.js';
import { Product, Sale, Creditor, Expense, RestockItem } from '../types';

class SQLiteDatabase {
  private db: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('ghuman-groceries-sqlite');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } else {
        this.db = new SQL.Database();
        await this.createTables();
        await this.initializeSampleData();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async createTables() {
    const queries = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT,
        sale_price REAL NOT NULL,
        purchase_price REAL,
        type TEXT NOT NULL CHECK (type IN ('units', 'kg')),
        quantity REAL NOT NULL DEFAULT 0,
        min_quantity REAL NOT NULL DEFAULT 5,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      // Sales table
      `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total REAL NOT NULL,
        buyer_name TEXT,
        payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'credit')),
        date TEXT NOT NULL,
        is_paid INTEGER NOT NULL DEFAULT 0
      )`,

      // Sale items table
      `CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        price_per_unit REAL NOT NULL,
        total REAL NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
      )`,

      // Creditors table
      `CREATE TABLE IF NOT EXISTS creditors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        total_debt REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        is_paid INTEGER NOT NULL DEFAULT 0,
        paid_amount REAL NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        due_date TEXT
      )`,

      // Restock items table
      `CREATE TABLE IF NOT EXISTS restock_items (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        is_custom INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        created_at TEXT NOT NULL
      )`
    ];

    queries.forEach(query => {
      this.db.run(query);
    });

    this.saveToStorage();
  }

  private saveToStorage() {
    if (this.db) {
      const data = this.db.export();
      localStorage.setItem('ghuman-groceries-sqlite', JSON.stringify(Array.from(data)));
    }
  }

  // Products
  getProducts(): Product[] {
    if (!this.initialized) return [];
    
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY name');
    const products = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      products.push({
        id: row.id,
        name: row.name,
        image: row.image || undefined,
        salePrice: row.sale_price,
        purchasePrice: row.purchase_price || undefined,
        type: row.type,
        quantity: row.quantity,
        minQuantity: row.min_quantity,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    }
    
    stmt.free();
    return products;
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    this.db.run(
      `INSERT INTO products (id, name, image, sale_price, purchase_price, type, quantity, min_quantity, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, product.name, product.image || null, product.salePrice, product.purchasePrice || null, 
       product.type, product.quantity, product.minQuantity, now, now]
    );
    
    this.saveToStorage();
    
    return {
      ...product,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const existing = this.db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'createdAt') return;
      
      const dbKey = key === 'salePrice' ? 'sale_price' : 
                   key === 'purchasePrice' ? 'purchase_price' :
                   key === 'minQuantity' ? 'min_quantity' : key;
      
      fields.push(`${dbKey} = ?`);
      values.push(value);
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);

      this.db.run(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    this.saveToStorage();
    
    const updated = this.db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
    return {
      id: updated.id,
      name: updated.name,
      image: updated.image || undefined,
      salePrice: updated.sale_price,
      purchasePrice: updated.purchase_price || undefined,
      type: updated.type,
      quantity: updated.quantity,
      minQuantity: updated.min_quantity,
      createdAt: new Date(updated.created_at),
      updatedAt: new Date(updated.updated_at)
    };
  }

  deleteProduct(id: string): boolean {
    const result = this.db.run('DELETE FROM products WHERE id = ?', [id]);
    this.saveToStorage();
    return result.changes > 0;
  }

  // Sales
  getSales(): Sale[] {
    if (!this.initialized) return [];
    
    const salesStmt = this.db.prepare('SELECT * FROM sales ORDER BY date DESC');
    const sales = [];
    
    while (salesStmt.step()) {
      const saleRow = salesStmt.getAsObject();
      
      // Get sale items
      const itemsStmt = this.db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
      itemsStmt.bind([saleRow.id]);
      const items = [];
      
      while (itemsStmt.step()) {
        const itemRow = itemsStmt.getAsObject();
        items.push({
          productId: itemRow.product_id,
          productName: itemRow.product_name,
          quantity: itemRow.quantity,
          pricePerUnit: itemRow.price_per_unit,
          total: itemRow.total,
          type: itemRow.type
        });
      }
      itemsStmt.free();
      
      sales.push({
        id: saleRow.id,
        items,
        total: saleRow.total,
        buyerName: saleRow.buyer_name || undefined,
        paymentType: saleRow.payment_type,
        date: new Date(saleRow.date),
        isPaid: Boolean(saleRow.is_paid)
      });
    }
    
    salesStmt.free();
    return sales;
  }

  addSale(sale: Omit<Sale, 'id'>): Sale {
    const saleId = Date.now().toString();
    const dateStr = sale.date.toISOString();
    
    // Insert sale
    this.db.run(
      `INSERT INTO sales (id, total, buyer_name, payment_type, date, is_paid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [saleId, sale.total, sale.buyerName || null, sale.paymentType, dateStr, sale.isPaid ? 1 : 0]
    );
    
    // Insert sale items
    sale.items.forEach((item, index) => {
      const itemId = `${saleId}_${index}`;
      this.db.run(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, price_per_unit, total, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [itemId, saleId, item.productId, item.productName, item.quantity, item.pricePerUnit, item.total, item.type]
      );
      
      // Update product quantity
      this.db.run(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    });
    
    // Handle credit sales
    if (sale.paymentType === 'credit' && sale.buyerName) {
      const existing = this.db.prepare('SELECT * FROM creditors WHERE name = ?').get([sale.buyerName]);
      
      if (existing) {
        this.db.run(
          'UPDATE creditors SET total_debt = total_debt + ?, updated_at = ? WHERE name = ?',
          [sale.total, new Date().toISOString(), sale.buyerName]
        );
      } else {
        const creditorId = Date.now().toString();
        const now = new Date().toISOString();
        this.db.run(
          `INSERT INTO creditors (id, name, total_debt, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [creditorId, sale.buyerName, sale.total, now, now]
        );
      }
    }
    
    this.saveToStorage();
    
    return {
      ...sale,
      id: saleId
    };
  }

  // Creditors
  getCreditors(): Creditor[] {
    if (!this.initialized) return [];
    
    const stmt = this.db.prepare('SELECT * FROM creditors WHERE total_debt > 0 ORDER BY total_debt DESC');
    const creditors = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      
      // Get purchases for this creditor
      const purchasesStmt = this.db.prepare('SELECT * FROM sales WHERE buyer_name = ? ORDER BY date DESC');
      purchasesStmt.bind([row.name]);
      const purchases = [];
      
      while (purchasesStmt.step()) {
        const saleRow = purchasesStmt.getAsObject();
        
        // Get sale items
        const itemsStmt = this.db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
        itemsStmt.bind([saleRow.id]);
        const items = [];
        
        while (itemsStmt.step()) {
          const itemRow = itemsStmt.getAsObject();
          items.push({
            productId: itemRow.product_id,
            productName: itemRow.product_name,
            quantity: itemRow.quantity,
            pricePerUnit: itemRow.price_per_unit,
            total: itemRow.total,
            type: itemRow.type
          });
        }
        itemsStmt.free();
        
        purchases.push({
          id: saleRow.id,
          items,
          total: saleRow.total,
          buyerName: saleRow.buyer_name,
          paymentType: saleRow.payment_type,
          date: new Date(saleRow.date),
          isPaid: Boolean(saleRow.is_paid)
        });
      }
      purchasesStmt.free();
      
      creditors.push({
        id: row.id,
        name: row.name,
        totalDebt: row.total_debt,
        purchases,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    }
    
    stmt.free();
    return creditors;
  }

  clearDebt(creditorId: string, amount: number): boolean {
    const creditor = this.db.prepare('SELECT * FROM creditors WHERE id = ?').get([creditorId]);
    if (!creditor) return false;

    const newDebt = Math.max(0, creditor.total_debt - amount);
    const now = new Date().toISOString();

    if (newDebt === 0) {
      this.db.run('DELETE FROM creditors WHERE id = ?', [creditorId]);
    } else {
      this.db.run(
        'UPDATE creditors SET total_debt = ?, updated_at = ? WHERE id = ?',
        [newDebt, now, creditorId]
      );
    }

    this.saveToStorage();
    return true;
  }

  // Expenses
  getExpenses(): Expense[] {
    if (!this.initialized) return [];
    
    const stmt = this.db.prepare('SELECT * FROM expenses ORDER BY date DESC');
    const expenses = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      expenses.push({
        id: row.id,
        category: row.category,
        amount: row.amount,
        description: row.description || '',
        isPaid: Boolean(row.is_paid),
        paidAmount: row.paid_amount,
        date: new Date(row.date),
        dueDate: row.due_date ? new Date(row.due_date) : undefined
      });
    }
    
    stmt.free();
    return expenses;
  }

  addExpense(expense: Omit<Expense, 'id'>): Expense {
    const id = Date.now().toString();
    
    this.db.run(
      `INSERT INTO expenses (id, category, amount, description, is_paid, paid_amount, date, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, expense.category, expense.amount, expense.description || '', 
       expense.isPaid ? 1 : 0, expense.paidAmount, expense.date.toISOString(),
       expense.dueDate ? expense.dueDate.toISOString() : null]
    );
    
    this.saveToStorage();
    
    return {
      ...expense,
      id
    };
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | null {
    const existing = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get([id]);
    if (!existing) return null;

    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id') return;
      
      const dbKey = key === 'isPaid' ? 'is_paid' : 
                   key === 'paidAmount' ? 'paid_amount' :
                   key === 'dueDate' ? 'due_date' : key;
      
      fields.push(`${dbKey} = ?`);
      if (key === 'isPaid') {
        values.push(value ? 1 : 0);
      } else if (key === 'date' || key === 'dueDate') {
        values.push(value ? new Date(value).toISOString() : null);
      } else {
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      this.db.run(
        `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    this.saveToStorage();
    
    const updated = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get([id]);
    return {
      id: updated.id,
      category: updated.category,
      amount: updated.amount,
      description: updated.description || '',
      isPaid: Boolean(updated.is_paid),
      paidAmount: updated.paid_amount,
      date: new Date(updated.date),
      dueDate: updated.due_date ? new Date(updated.due_date) : undefined
    };
  }

  // Restock Items
  getRestockItems(): RestockItem[] {
    if (!this.initialized) return [];
    
    const stmt = this.db.prepare('SELECT * FROM restock_items ORDER BY priority DESC, created_at DESC');
    const items = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      items.push({
        id: row.id,
        productId: row.product_id || undefined,
        productName: row.product_name,
        quantity: row.quantity,
        isCustom: Boolean(row.is_custom),
        priority: row.priority,
        createdAt: new Date(row.created_at)
      });
    }
    
    stmt.free();
    return items;
  }

  addRestockItem(item: Omit<RestockItem, 'id' | 'createdAt'>): RestockItem {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    this.db.run(
      `INSERT INTO restock_items (id, product_id, product_name, quantity, is_custom, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, item.productId || null, item.productName, item.quantity, 
       item.isCustom ? 1 : 0, item.priority, now]
    );
    
    this.saveToStorage();
    
    return {
      ...item,
      id,
      createdAt: new Date(now)
    };
  }

  removeRestockItem(id: string): boolean {
    const result = this.db.run('DELETE FROM restock_items WHERE id = ?', [id]);
    this.saveToStorage();
    return result.changes > 0;
  }

  clearRestockList(): void {
    this.db.run('DELETE FROM restock_items');
    this.saveToStorage();
  }

  generateLowStockItems(): RestockItem[] {
    const lowStockStmt = this.db.prepare('SELECT * FROM products WHERE quantity <= min_quantity');
    const items = [];
    
    while (lowStockStmt.step()) {
      const product = lowStockStmt.getAsObject();
      
      // Check if already exists
      const exists = this.db.prepare('SELECT id FROM restock_items WHERE product_id = ?').get([product.id]);
      if (!exists) {
        const item = this.addRestockItem({
          productId: product.id,
          productName: product.name,
          quantity: product.min_quantity * 2,
          isCustom: false,
          priority: product.quantity === 0 ? 'high' : 'medium'
        });
        items.push(item);
      }
    }
    
    lowStockStmt.free();
    return this.getRestockItems();
  }

  // Backup and Restore
  exportData(): string {
    if (!this.db) return '{}';
    
    const data = {
      products: this.getProducts(),
      sales: this.getSales(),
      creditors: this.getCreditors(),
      expenses: this.getExpenses(),
      restockItems: this.getRestockItems()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      this.db.run('DELETE FROM restock_items');
      this.db.run('DELETE FROM expenses');
      this.db.run('DELETE FROM sale_items');
      this.db.run('DELETE FROM sales');
      this.db.run('DELETE FROM creditors');
      this.db.run('DELETE FROM products');
      
      // Import data
      if (data.products) {
        data.products.forEach((product: any) => {
          this.db.run(
            `INSERT INTO products (id, name, image, sale_price, purchase_price, type, quantity, min_quantity, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [product.id, product.name, product.image || null, product.salePrice, 
             product.purchasePrice || null, product.type, product.quantity, 
             product.minQuantity, product.createdAt, product.updatedAt]
          );
        });
      }
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const sampleProducts = [
      {
        name: 'Basmati Rice',
        salePrice: 120,
        purchasePrice: 100,
        type: 'kg' as const,
        quantity: 50,
        minQuantity: 10
      },
      {
        name: 'Maggi Noodles',
        salePrice: 15,
        purchasePrice: 12,
        type: 'units' as const,
        quantity: 100,
        minQuantity: 20
      },
      {
        name: 'Toor Dal',
        salePrice: 150,
        purchasePrice: 130,
        type: 'kg' as const,
        quantity: 25,
        minQuantity: 5
      }
    ];
    
    sampleProducts.forEach(product => {
      this.addProduct(product);
    });
  }
}

// Create singleton instance
export const db = new SQLiteDatabase();

// Initialize database when module loads
db.initialize().catch(console.error);