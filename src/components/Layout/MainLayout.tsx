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
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
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
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {!isHome && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-lg lg:hidden transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <h1 className={`text-xl sm:text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ghuman Groceries
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className={`text-sm hidden sm:block transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
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
            } ${darkMode ? 'bg-slate-800 shadow-xl' : 'bg-white shadow-lg'} mt-16 lg:mt-0`}>
              <div className="p-4">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Home</span>
                </button>
              </div>
              <div className={`border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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
                            : darkMode 
                            ? 'text-slate-300 hover:bg-slate-700' 
                            : 'text-gray-700 hover:bg-gray-100'
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
        <main className="flex-1 overflow-auto">
          {isHome ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              {/* Horizontal Tab Navigation for Home */}
              <div className="mb-6 sm:mb-8">
                <nav className={`flex space-x-2 sm:space-x-8 rounded-lg shadow-sm p-2 overflow-x-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : darkMode
                            ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
  );
};

export default MainLayout;