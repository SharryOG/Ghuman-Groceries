import React, { useState } from 'react';
import { useCreditors } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  ShoppingBag,
  DollarSign,
  CreditCard,
  Minus,
  Check
} from 'lucide-react';

interface CreditorDetailsProps {
  creditorId: string;
  onBack: () => void;
}

const CreditorDetails: React.FC<CreditorDetailsProps> = ({ creditorId, onBack }) => {
  const { creditors, clearDebt } = useCreditors();
  const [clearAmount, setClearAmount] = useState('');
  const [showClearForm, setShowClearForm] = useState(false);

  const creditor = creditors.find(c => c.id === creditorId);

  if (!creditor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Creditor not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const handleClearDebt = async () => {
    const amount = parseFloat(clearAmount);
    if (amount > 0 && amount <= creditor.totalDebt) {
      await clearDebt(creditor.id, amount);
      setClearAmount('');
      setShowClearForm(false);
    }
  };

  const sortedPurchases = [...creditor.purchases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <User className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{creditor.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Customer since {format(new Date(creditor.createdAt), 'PP')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>{creditor.purchases.length} purchases</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Debt</h3>
            <CreditCard className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-4">
            {formatCurrency(creditor.totalDebt)}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setShowClearForm(!showClearForm)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Minus className="h-4 w-4" />
              <span>Clear Debt</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Summary</h3>
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Purchases:</span>
              <span className="font-medium">{creditor.purchases.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">
                {formatCurrency(creditor.purchases.reduce((sum, purchase) => sum + purchase.total, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Purchase:</span>
              <span className="font-medium">
                {creditor.purchases.length > 0 
                  ? format(new Date(Math.max(...creditor.purchases.map(p => new Date(p.date).getTime()))), 'PP')
                  : 'None'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Debt Form */}
      {showClearForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Debt</h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Clear
              </label>
              <input
                type="number"
                value={clearAmount}
                onChange={(e) => setClearAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount"
                max={creditor.totalDebt}
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleClearDebt}
                disabled={!clearAmount || parseFloat(clearAmount) <= 0 || parseFloat(clearAmount) > creditor.totalDebt}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setClearAmount('');
                  setShowClearForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Maximum amount: {formatCurrency(creditor.totalDebt)}
          </p>
        </div>
      )}

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
        </div>
        
        {sortedPurchases.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedPurchases.map((purchase) => (
              <div key={purchase.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(purchase.date), 'PPP')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(purchase.date), 'p')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(purchase.total)}
                    </p>
                    <p className="text-sm text-orange-600">Credit</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Items:</h4>
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        {item.productName} ({item.quantity} {item.type})
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No purchases found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditorDetails;