import React, { useState } from 'react';
import { useSales } from '../../hooks/useDatabase';
import SalesInterface from './SalesInterface';
import SalesHistory from './SalesHistory';
import { ShoppingCart, History, Plus } from 'lucide-react';

const SalesTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'new-sale' | 'history'>('new-sale');
  const { sales } = useSales();

  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  );

  const views = [
    { id: 'new-sale' as const, label: 'New Sale', icon: Plus, count: null },
    { id: 'history' as const, label: 'Sales History', icon: History, count: sales.length }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'new-sale':
        return <SalesInterface />;
      case 'history':
        return <SalesHistory />;
      default:
        return <SalesInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Management</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{todaySales.length} Sales Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>{sales.length} Total Sales</span>
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
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{view.label}</span>
                  {view.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeView === view.id
                        ? 'bg-green-500 text-white'
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

export default SalesTab;