import React, { useState } from 'react';
import BackupRestore from './BackupRestore';
import { Settings, Database, Download } from 'lucide-react';

const SettingsTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'backup-restore'>('backup-restore');

  const views = [
    { id: 'backup-restore' as const, label: 'Backup & Restore', icon: Database, count: null }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'backup-restore':
        return <BackupRestore />;
      default:
        return <BackupRestore />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your application settings and data</p>
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
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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