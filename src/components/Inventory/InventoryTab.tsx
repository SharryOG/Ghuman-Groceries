import React, { useState } from 'react';
import { useProducts, useRestockItems } from '../../hooks/useDatabase';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import RestockList from './RestockList';
import { Package, Plus, AlertTriangle, ShoppingCart } from 'lucide-react';

const InventoryTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'products' | 'restock' | 'add'>('products');
  const { products } = useProducts();
  const { restockItems } = useRestockItems();

  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  const views = [
    { id: 'products' as const, label: 'Products', icon: Package, count: products.length },
    { id: 'restock' as const, label: 'Restock List', icon: AlertTriangle, count: restockItems.length },
    { id: 'add' as const, label: 'Add Product', icon: Plus, count: null }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return <ProductList />;
      case 'restock':
        return <RestockList />;
      case 'add':
        return <ProductForm onSuccess={() => setActiveView('products')} />;
      default:
        return <ProductList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>{products.length} Total Products</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{lowStockCount} Low Stock</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-red-500" />
              <span>{outOfStockCount} Out of Stock</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 bg-white rounded-lg shadow-sm p-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{view.label}</span>
                  {view.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeView === view.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {view.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default InventoryTab;