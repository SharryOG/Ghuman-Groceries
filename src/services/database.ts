import initSqlJs from 'sql.js';
import { Product, Sale, Creditor, Expense, RestockItem, Payment, BackupData } from '../types';

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
        try {
          const uint8Array = new Uint8Array(JSON.parse(savedDb));
          this.db = new SQL.Database(uint8Array);
          // Run migrations for existing database
          await this.runMigrations();
        } catch (error) {
          console.warn('Failed to load existing database, creating new one:', error);
          this.db = new SQL.Database();
          await this.createTables();
          await this.initializeSampleData();
        }
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

  private async runMigrations() {
    try {
      // Check if payments table exists, if not create it
      try {
        this.db.prepare('SELECT 1 FROM payments LIMIT 1').step();
      } catch (error) {
        console.log('Creating missing payments table...');
        this.db.run(`CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          description TEXT NOT NULL,
          upi_id TEXT,
          recipient_name TEXT,
          status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
          date TEXT NOT NULL
        )`);
      }

      // Check for other missing tables and create them
      const tables = ['products', 'sales', 'sale_items', 'creditors', 'expenses', 'restock_items'];
      
      for (const table of tables) {
        try {
          this.db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).step();
        } catch (error) {
          console.log(`Creating missing ${table} table...`);
          await this.createSpecificTable(table);
        }
      }

      this.saveToStorage();
    } catch (error) {
      console.error('Migration failed:', error);
      // If migration fails, recreate all tables
      await this.createTables();
    }
  }

  private async createSpecificTable(tableName: string) {
    const tableQueries: Record<string, string> = {
      products: `CREATE TABLE IF NOT EXISTS products (
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
      sales: `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total REAL NOT NULL,
        buyer_name TEXT,
        payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'credit')),
        date TEXT NOT NULL,
        is_paid INTEGER NOT NULL DEFAULT 0
      )`,
      sale_items: `CREATE TABLE IF NOT EXISTS sale_items (
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
      creditors: `CREATE TABLE IF NOT EXISTS creditors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        total_debt REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      expenses: `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        is_paid INTEGER NOT NULL DEFAULT 0,
        paid_amount REAL NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        due_date TEXT
      )`,
      restock_items: `CREATE TABLE IF NOT EXISTS restock_items (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        is_custom INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        created_at TEXT NOT NULL
      )`
    };

    if (tableQueries[tableName]) {
      this.db.run(tableQueries[tableName]);
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
      )`,

      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        upi_id TEXT,
        recipient_name TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
        date TEXT NOT NULL
      )`
    ];

    try {
      queries.forEach(query => {
        this.db.run(query);
      });
      this.saveToStorage();
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  private saveToStorage() {
    try {
      if (this.db) {
        const data = this.db.export();
        localStorage.setItem('ghuman-groceries-sqlite', JSON.stringify(Array.from(data)));
      }
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  // Safe query execution with error handling
  private safeQuery(query: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(query);
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('Query failed:', query, error);
      return [];
    }
  }

  private safeRun(query: string, params: any[] = []): boolean {
    try {
      this.db.run(query, params);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Run failed:', query, error);
      return false;
    }
  }

  // Products
  getProducts(): Product[] {
    if (!this.initialized) return [];
    
    const results = this.safeQuery('SELECT * FROM products ORDER BY name');
    return results.map(row => ({
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
    }));
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const success = this.safeRun(
      `INSERT INTO products (id, name, image, sale_price, purchase_price, type, quantity, min_quantity, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, product.name, product.image || null, product.salePrice, product.purchasePrice || null, 
       product.type, product.quantity, product.minQuantity, now, now]
    );
    
    if (!success) {
      throw new Error('Failed to add product');
    }
    
    return {
      ...product,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const existing = this.safeQuery('SELECT * FROM products WHERE id = ?', [id])[0];
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

      this.safeRun(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const updated = this.safeQuery('SELECT * FROM products WHERE id = ?', [id])[0];
    if (!updated) return null;
    
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
    return this.safeRun('DELETE FROM products WHERE id = ?', [id]);
  }

  // Sales
  getSales(): Sale[] {
    if (!this.initialized) return [];
    
    const salesResults = this.safeQuery('SELECT * FROM sales ORDER BY date DESC');
    const sales = [];
    
    for (const saleRow of salesResults) {
      const itemsResults = this.safeQuery('SELECT * FROM sale_items WHERE sale_id = ?', [saleRow.id]);
      const items = itemsResults.map(itemRow => ({
        productId: itemRow.product_id,
        productName: itemRow.product_name,
        quantity: itemRow.quantity,
        pricePerUnit: itemRow.price_per_unit,
        total: itemRow.total,
        type: itemRow.type
      }));
      
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
    
    return sales;
  }

  addSale(sale: Omit<Sale, 'id'>): Sale {
    const saleId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const dateStr = sale.date.toISOString();
    
    // Insert sale
    const saleSuccess = this.safeRun(
      `INSERT INTO sales (id, total, buyer_name, payment_type, date, is_paid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [saleId, sale.total, sale.buyerName || null, sale.paymentType, dateStr, sale.isPaid ? 1 : 0]
    );

    if (!saleSuccess) {
      throw new Error('Failed to add sale');
    }
    
    // Insert sale items and update product quantities
    sale.items.forEach((item, index) => {
      const itemId = `${saleId}_${index}`;
      this.safeRun(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, price_per_unit, total, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [itemId, saleId, item.productId, item.productName, item.quantity, item.pricePerUnit, item.total, item.type]
      );
      
      // Update product quantity
      this.safeRun(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    });
    
    // Handle credit sales
    if (sale.paymentType === 'credit' && sale.buyerName) {
      const existing = this.safeQuery('SELECT * FROM creditors WHERE name = ?', [sale.buyerName])[0];
      
      if (existing) {
        this.safeRun(
          'UPDATE creditors SET total_debt = total_debt + ?, updated_at = ? WHERE name = ?',
          [sale.total, new Date().toISOString(), sale.buyerName]
        );
      } else {
        const creditorId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        this.safeRun(
          `INSERT INTO creditors (id, name, total_debt, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [creditorId, sale.buyerName, sale.total, now, now]
        );
      }
    }
    
    return {
      ...sale,
      id: saleId
    };
  }

  // Creditors
  getCreditors(): Creditor[] {
    if (!this.initialized) return [];
    
    const creditorsResults = this.safeQuery('SELECT * FROM creditors WHERE total_debt > 0 ORDER BY total_debt DESC');
    const creditors = [];
    
    for (const row of creditorsResults) {
      const purchasesResults = this.safeQuery('SELECT * FROM sales WHERE buyer_name = ? ORDER BY date DESC', [row.name]);
      const purchases = [];
      
      for (const saleRow of purchasesResults) {
        const itemsResults = this.safeQuery('SELECT * FROM sale_items WHERE sale_id = ?', [saleRow.id]);
        const items = itemsResults.map(itemRow => ({
          productId: itemRow.product_id,
          productName: itemRow.product_name,
          quantity: itemRow.quantity,
          pricePerUnit: itemRow.price_per_unit,
          total: itemRow.total,
          type: itemRow.type
        }));
        
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
      
      creditors.push({
        id: row.id,
        name: row.name,
        totalDebt: row.total_debt,
        purchases,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    }
    
    return creditors;
  }

  clearDebt(creditorId: string, amount: number): boolean {
    const creditor = this.safeQuery('SELECT * FROM creditors WHERE id = ?', [creditorId])[0];
    if (!creditor) return false;

    const newDebt = Math.max(0, creditor.total_debt - amount);
    const now = new Date().toISOString();

    if (newDebt === 0) {
      return this.safeRun('DELETE FROM creditors WHERE id = ?', [creditorId]);
    } else {
      return this.safeRun(
        'UPDATE creditors SET total_debt = ?, updated_at = ? WHERE id = ?',
        [newDebt, now, creditorId]
      );
    }
  }

  // Expenses
  getExpenses(): Expense[] {
    if (!this.initialized) return [];
    
    const results = this.safeQuery('SELECT * FROM expenses ORDER BY date DESC');
    return results.map(row => ({
      id: row.id,
      category: row.category,
      amount: row.amount,
      description: row.description || '',
      isPaid: Boolean(row.is_paid),
      paidAmount: row.paid_amount,
      date: new Date(row.date),
      dueDate: row.due_date ? new Date(row.due_date) : undefined
    }));
  }

  addExpense(expense: Omit<Expense, 'id'>): Expense {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const success = this.safeRun(
      `INSERT INTO expenses (id, category, amount, description, is_paid, paid_amount, date, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, expense.category, expense.amount, expense.description || '', 
       expense.isPaid ? 1 : 0, expense.paidAmount, expense.date.toISOString(),
       expense.dueDate ? expense.dueDate.toISOString() : null]
    );

    if (!success) {
      throw new Error('Failed to add expense');
    }
    
    return {
      ...expense,
      id
    };
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | null {
    const existing = this.safeQuery('SELECT * FROM expenses WHERE id = ?', [id])[0];
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
      this.safeRun(
        `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const updated = this.safeQuery('SELECT * FROM expenses WHERE id = ?', [id])[0];
    if (!updated) return null;
    
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
    
    const results = this.safeQuery('SELECT * FROM restock_items ORDER BY priority DESC, created_at DESC');
    return results.map(row => ({
      id: row.id,
      productId: row.product_id || undefined,
      productName: row.product_name,
      quantity: row.quantity,
      isCustom: Boolean(row.is_custom),
      priority: row.priority,
      createdAt: new Date(row.created_at)
    }));
  }

  addRestockItem(item: Omit<RestockItem, 'id' | 'createdAt'>): RestockItem {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const success = this.safeRun(
      `INSERT INTO restock_items (id, product_id, product_name, quantity, is_custom, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, item.productId || null, item.productName, item.quantity, 
       item.isCustom ? 1 : 0, item.priority, now]
    );

    if (!success) {
      throw new Error('Failed to add restock item');
    }
    
    return {
      ...item,
      id,
      createdAt: new Date(now)
    };
  }

  removeRestockItem(id: string): boolean {
    return this.safeRun('DELETE FROM restock_items WHERE id = ?', [id]);
  }

  clearRestockList(): void {
    this.safeRun('DELETE FROM restock_items');
  }

  generateLowStockItems(): RestockItem[] {
    const lowStockResults = this.safeQuery('SELECT * FROM products WHERE quantity <= min_quantity');
    const items = [];
    
    for (const product of lowStockResults) {
      const exists = this.safeQuery('SELECT id FROM restock_items WHERE product_id = ?', [product.id])[0];
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
    
    return this.getRestockItems();
  }

  // Payments
  getPayments(): Payment[] {
    if (!this.initialized) return [];
    
    const results = this.safeQuery('SELECT * FROM payments ORDER BY date DESC');
    return results.map(row => ({
      id: row.id,
      amount: row.amount,
      description: row.description,
      upiId: row.upi_id || undefined,
      recipientName: row.recipient_name || undefined,
      status: row.status,
      date: new Date(row.date)
    }));
  }

  addPayment(payment: Omit<Payment, 'id'>): Payment {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const success = this.safeRun(
      `INSERT INTO payments (id, amount, description, upi_id, recipient_name, status, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, payment.amount, payment.description, payment.upiId || null, 
       payment.recipientName || null, payment.status, payment.date.toISOString()]
    );

    if (!success) {
      throw new Error('Failed to add payment');
    }
    
    return {
      ...payment,
      id
    };
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const existing = this.safeQuery('SELECT * FROM payments WHERE id = ?', [id])[0];
    if (!existing) return null;

    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id') return;
      
      const dbKey = key === 'upiId' ? 'upi_id' : 
                   key === 'recipientName' ? 'recipient_name' : key;
      
      fields.push(`${dbKey} = ?`);
      if (key === 'date') {
        values.push(new Date(value).toISOString());
      } else {
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      this.safeRun(
        `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const updated = this.safeQuery('SELECT * FROM payments WHERE id = ?', [id])[0];
    if (!updated) return null;
    
    return {
      id: updated.id,
      amount: updated.amount,
      description: updated.description,
      upiId: updated.upi_id || undefined,
      recipientName: updated.recipient_name || undefined,
      status: updated.status,
      date: new Date(updated.date)
    };
  }

  // Backup and Restore
  exportData(): string {
    if (!this.db) return '{}';
    
    const data: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      products: this.getProducts(),
      sales: this.getSales(),
      creditors: this.getCreditors(),
      expenses: this.getExpenses(),
      restockItems: this.getRestockItems(),
      payments: this.getPayments()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data: BackupData = JSON.parse(jsonData);
      
      // Validate backup data structure
      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup file format');
      }
      
      // Clear existing data
      this.safeRun('DELETE FROM payments');
      this.safeRun('DELETE FROM restock_items');
      this.safeRun('DELETE FROM expenses');
      this.safeRun('DELETE FROM sale_items');
      this.safeRun('DELETE FROM sales');
      this.safeRun('DELETE FROM creditors');
      this.safeRun('DELETE FROM products');
      
      // Import products
      if (data.products) {
        data.products.forEach((product: Product) => {
          this.safeRun(
            `INSERT INTO products (id, name, image, sale_price, purchase_price, type, quantity, min_quantity, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [product.id, product.name, product.image || null, product.salePrice, 
             product.purchasePrice || null, product.type, product.quantity, 
             product.minQuantity, product.createdAt.toISOString(), product.updatedAt.toISOString()]
          );
        });
      }
      
      // Import sales
      if (data.sales) {
        data.sales.forEach((sale: Sale) => {
          this.safeRun(
            `INSERT INTO sales (id, total, buyer_name, payment_type, date, is_paid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [sale.id, sale.total, sale.buyerName || null, sale.paymentType, 
             sale.date.toISOString(), sale.isPaid ? 1 : 0]
          );
          
          // Import sale items
          sale.items.forEach((item, index) => {
            const itemId = `${sale.id}_${index}`;
            this.safeRun(
              `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, price_per_unit, total, type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [itemId, sale.id, item.productId, item.productName, item.quantity, 
               item.pricePerUnit, item.total, item.type]
            );
          });
        });
      }
      
      // Import creditors
      if (data.creditors) {
        data.creditors.forEach((creditor: Creditor) => {
          this.safeRun(
            `INSERT INTO creditors (id, name, total_debt, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [creditor.id, creditor.name, creditor.totalDebt, 
             creditor.createdAt.toISOString(), creditor.updatedAt.toISOString()]
          );
        });
      }
      
      // Import expenses
      if (data.expenses) {
        data.expenses.forEach((expense: Expense) => {
          this.safeRun(
            `INSERT INTO expenses (id, category, amount, description, is_paid, paid_amount, date, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [expense.id, expense.category, expense.amount, expense.description, 
             expense.isPaid ? 1 : 0, expense.paidAmount, expense.date.toISOString(),
             expense.dueDate ? expense.dueDate.toISOString() : null]
          );
        });
      }
      
      // Import restock items
      if (data.restockItems) {
        data.restockItems.forEach((item: RestockItem) => {
          this.safeRun(
            `INSERT INTO restock_items (id, product_id, product_name, quantity, is_custom, priority, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.id, item.productId || null, item.productName, item.quantity, 
             item.isCustom ? 1 : 0, item.priority, item.createdAt.toISOString()]
          );
        });
      }
      
      // Import payments
      if (data.payments) {
        data.payments.forEach((payment: Payment) => {
          this.safeRun(
            `INSERT INTO payments (id, amount, description, upi_id, recipient_name, status, date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [payment.id, payment.amount, payment.description, payment.upiId || null, 
             payment.recipientName || null, payment.status, payment.date.toISOString()]
          );
        });
      }
      
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
      try {
        this.addProduct(product);
      } catch (error) {
        console.error('Failed to add sample product:', error);
      }
    });
  }
}

// Create singleton instance
export const db = new SQLiteDatabase();

// Initialize database when module loads
db.initialize().catch(console.error);