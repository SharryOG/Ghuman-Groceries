import React, { useState, useEffect } from 'react';
import { TabType } from '../../types';
import { Home, BarChart3, Package, ShoppingCart, Users, CreditCard, DollarSign, Settings, Menu, X, Moon, Sun } from 'lucide-react';
import HomePage from '../HomePage/HomePage';
import AnalyticsTab from '../Analytics/AnalyticsTab';
import InventoryTab from '../Inventory/InventoryTab';
import SalesTab from '../Sales/SalesTab';
import CreditorsTab from '../Creditors/CreditorsTab';
import PaymentsTab from '../Payments/PaymentsTab';
import PricingTab from '../Pricing/PricingTab';
import SettingsTab from '../Settings/SettingsTab';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference or default to false
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDark = savedDarkMode === 'true';
    setDarkMode(isDark);
    
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply dark mode class to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'payments' as TabType, label: 'Payments', icon: CreditCard },
    { id: 'pricing' as TabType, label: 'Pricing', icon: DollarSign },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'inventory' as TabType, label: 'Inventory', icon: Package },
    { id: 'sales' as TabType, label: 'Sales', icon: ShoppingCart },
    { id: 'creditors' as TabType, label: 'Creditors', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onTabChange={setActiveTab} />;
      case 'payments':
        return <PaymentsTab />;
      case 'pricing':
        return <PricingTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'sales':
        return <SalesTab />;
      case 'creditors':
        return <CreditorsTab />;
      case 'settings':
        return <SettingsTab onDarkModeToggle={toggleDarkMode} darkMode={darkMode} />;
      default:
        return <HomePage onTabChange={setActiveTab} />;
    }
  };

  const isHome = activeTab === 'home';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {!isHome && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg lg:hidden text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                )}
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                    Ghuman Groceries
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <div className="text-sm hidden sm:block text-gray-600 dark:text-slate-300 transition-colors">
                  {new Date().toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-screen pt-16">
          {/* Sidebar Navigation */}
          {!isHome && (
            <>
              {/* Mobile Overlay */}
              {sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar */}
              <nav className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } bg-white dark:bg-slate-800 shadow-lg mt-16 lg:mt-0 border-r border-gray-200 dark:border-slate-700`}>
                <div className="p-4">
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    <span>Back to Home</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700">
                  <div className="p-4 space-y-2">
                    {tabs.filter(tab => tab.id !== 'home').map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900">
            {isHome ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Horizontal Tab Navigation for Home */}
                <div className="mb-6 sm:mb-8">
                  <nav className="flex space-x-2 sm:space-x-8 rounded-lg shadow-sm p-2 overflow-x-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
                {renderContent()}
              </div>
            ) : (
              <div className="p-4 sm:p-8">
                {renderContent()}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;