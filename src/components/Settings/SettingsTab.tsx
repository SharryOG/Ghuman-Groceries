import React, { useState } from 'react';
import BackupRestore from './BackupRestore';
import { Settings, Database, Moon, Sun, User } from 'lucide-react';

interface SettingsTabProps {
  onDarkModeToggle: () => void;
  darkMode: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onDarkModeToggle, darkMode }) => {
  const [activeView, setActiveView] = useState<'general' | 'backup-restore'>('general');
  const [recipientName, setRecipientName] = useState(() => 
    localStorage.getItem('recipientName') || 'GURINDER SINGH'
  );
  const [upiId, setUpiId] = useState(() => 
    localStorage.getItem('upiId') || 'ghumangroceries@pnb'
  );

  const views = [
    { id: 'general' as const, label: 'General', icon: Settings, count: null },
    { id: 'backup-restore' as const, label: 'Backup & Restore', icon: Database, count: null }
  ];

  const saveSettings = () => {
    localStorage.setItem('recipientName', recipientName);
    localStorage.setItem('upiId', upiId);
    alert('Settings saved successfully!');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Payment Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Settings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Enter recipient name"
                  />
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    This name will appear on payment QR codes
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="your-upi@bank"
                  />
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Your UPI ID for receiving payments
                  </p>
                </div>
                
                <button
                  onClick={saveSettings}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Toggle between light and dark theme</p>
                  </div>
                  <button
                    onClick={onDarkModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">Light</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Moon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">Dark</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Version:</span>
                  <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Last Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Database:</span>
                  <span className="font-medium text-gray-900 dark:text-white">SQLite (Local)</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'backup-restore':
        return <BackupRestore />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage your application settings and data</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{view.label}</span>
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

export default SettingsTab;