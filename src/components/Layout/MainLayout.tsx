import React, { useState } from 'react';
import { TabType } from '../../types';
import { Home, BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import HomePage from '../HomePage/HomePage';
import AnalyticsTab from '../Analytics/AnalyticsTab';
import InventoryTab from '../Inventory/InventoryTab';
import SalesTab from '../Sales/SalesTab';
import CreditorsTab from '../Creditors/CreditorsTab';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'inventory' as TabType, label: 'Inventory', icon: Package },
    { id: 'sales' as TabType, label: 'Sales', icon: ShoppingCart },
    { id: 'creditors' as TabType, label: 'Creditors', icon: Users }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'sales':
        return <SalesTab />;
      case 'creditors':
        return <CreditorsTab />;
      default:
        return <HomePage />;
    }
  };

  const isHome = activeTab === 'home';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Ghuman Groceries</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Sidebar Navigation */}
        {!isHome && (
          <nav className="w-64 bg-white shadow-lg">
            <div className="p-4">
              <button
                onClick={() => setActiveTab('home')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <div className="border-t">
              {/* Tab-specific navigation will be added here */}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${!isHome ? 'ml-0' : ''}`}>
          {isHome ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Horizontal Tab Navigation for Home */}
              <div className="mb-8">
                <nav className="flex space-x-8 bg-white rounded-lg shadow-sm p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              {renderContent()}
            </div>
          ) : (
            <div className="p-8">
              {renderContent()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;