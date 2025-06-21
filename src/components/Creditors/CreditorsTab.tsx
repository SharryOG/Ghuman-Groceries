import React, { useState } from 'react';
import { useCreditors } from '../../hooks/useDatabase';
import CreditorsList from './CreditorsList';
import CreditorDetails from './CreditorDetails';
import { Users, CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

const CreditorsTab: React.FC = () => {
  const { creditors } = useCreditors();
  const [selectedCreditor, setSelectedCreditor] = useState<string | null>(null);

  const totalDebt = creditors.reduce((sum, creditor) => sum + creditor.totalDebt, 0);
  const totalCreditors = creditors.length;

  const handleSelectCreditor = (creditorId: string) => {
    setSelectedCreditor(creditorId);
  };

  const handleBackToList = () => {
    setSelectedCreditor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creditors Management</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{totalCreditors} Active Creditors</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Total Debt: {formatCurrency(totalDebt)}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Creditors</p>
                <p className="text-2xl font-bold text-gray-900">{totalCreditors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Debt</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalCreditors > 0 ? totalDebt / totalCreditors : 0)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedCreditor ? (
          <CreditorDetails 
            creditorId={selectedCreditor} 
            onBack={handleBackToList}
          />
        ) : (
          <CreditorsList onSelectCreditor={handleSelectCreditor} />
        )}
      </div>
    </div>
  );
};

export default CreditorsTab;