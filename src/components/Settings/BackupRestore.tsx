import React, { useState, useRef } from 'react';
import { db } from '../../services/database';
import { BackupData } from '../../types';
import { 
  Download, 
  Upload, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Calendar,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Receipt,
  RefreshCw
} from 'lucide-react';

const BackupRestore: React.FC = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupStatus('idle');
    
    try {
      // Get all data from database
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        products: db.getProducts(),
        sales: db.getSales(),
        creditors: db.getCreditors(),
        expenses: db.getExpenses(),
        restockItems: db.getRestockItems(),
        payments: db.getPayments()
      };

      // Create JSON string
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ghuman-groceries-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setBackupStatus('success');
      setStatusMessage('Backup created and downloaded successfully!');
    } catch (error) {
      console.error('Backup creation failed:', error);
      setBackupStatus('error');
      setStatusMessage('Failed to create backup. Please try again.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      restoreFromBackup(file);
    }
  };

  const restoreFromBackup = async (file: File) => {
    setIsRestoring(true);
    setRestoreStatus('idle');
    
    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);
      
      // Validate backup data structure
      if (!backupData.version || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }
      
      // Confirm with user
      const confirmRestore = window.confirm(
        `This will replace all current data with the backup from ${new Date(backupData.timestamp).toLocaleString()}. Are you sure you want to continue?`
      );
      
      if (!confirmRestore) {
        setIsRestoring(false);
        return;
      }
      
      // Import data
      const success = await db.importData(JSON.stringify(backupData));
      
      if (success) {
        setRestoreStatus('success');
        setStatusMessage('Data restored successfully! Please refresh the page to see changes.');
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      setRestoreStatus('error');
      setStatusMessage('Failed to restore backup. Please check the file and try again.');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDataSummary = () => {
    return [
      { label: 'Products', count: db.getProducts().length, icon: Package },
      { label: 'Sales', count: db.getSales().length, icon: ShoppingCart },
      { label: 'Creditors', count: db.getCreditors().length, icon: Users },
      { label: 'Expenses', count: db.getExpenses().length, icon: Receipt },
      { label: 'Restock Items', count: db.getRestockItems().length, icon: RefreshCw },
      { label: 'Payments', count: db.getPayments().length, icon: CreditCard }
    ];
  };

  const dataSummary = getDataSummary();

  return (
    <div className="space-y-8">
      {/* Current Data Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Current Data Summary</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dataSummary.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <Icon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Download className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Create Backup</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Create a complete backup of all your data including products, sales, creditors, expenses, 
            inventory, and payment information. The backup will be downloaded as a JSON file.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">What's included in the backup:</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• All product information and inventory levels</li>
                  <li>• Complete sales history and transaction details</li>
                  <li>• Creditor information and outstanding debts</li>
                  <li>• Expense records and payment status</li>
                  <li>• Restock items and priority settings</li>
                  <li>• Payment history and UPI transaction records</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={createBackup}
            disabled={isCreatingBackup}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreatingBackup ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Backup...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Download Backup</span>
              </>
            )}
          </button>
          
          {backupStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{statusMessage}</span>
            </div>
          )}
          
          {backupStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Restore from Backup</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload a backup file to restore your data. This will replace all current data with the data from the backup file.
          </p>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Important Warning:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Restoring from a backup will permanently replace all current data. 
                  Make sure to create a backup of your current data before proceeding if you want to keep it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRestoring ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload Backup File</span>
                </>
              )}
            </button>
          </div>
          
          {restoreStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{statusMessage}</span>
            </div>
          )}
          
          {restoreStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Backup Best Practices</h3>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Create regular backups to prevent data loss</p>
          <p>• Store backup files in a safe location (cloud storage, external drive)</p>
          <p>• Test your backups periodically by restoring them in a test environment</p>
          <p>• Keep multiple backup versions for different time periods</p>
          <p>• Always create a backup before making major changes to your data</p>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;