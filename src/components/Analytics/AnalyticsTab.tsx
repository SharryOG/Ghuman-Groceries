import React, { useState } from 'react';
import { useSales, useExpenses } from '../../hooks/useDatabase';
import SalesAnalytics from './SalesAnalytics';
import ExpenseManagement from './ExpenseManagement';
import { BarChart3, TrendingUp, DollarSign, Receipt } from 'lucide-react';

const AnalyticsTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'sales' | 'expenses'>('sales');
  const { sales } = useSales();
  const { expenses } = useExpenses();

  const views = [
    { id: 'sales' as const, label: 'Sales Analytics', icon: TrendingUp, count: sales.length },
    { id: 'expenses' as const, label: 'Expense Management', icon: Receipt, count: expenses.length }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'sales':
        return <SalesAnalytics />;
      case 'expenses':
        return <ExpenseManagement />;
      default:
        return <SalesAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Track your business performance and manage expenses</p>
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
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{view.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeView === view.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {view.count}
                  </span>
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

export default AnalyticsTab;