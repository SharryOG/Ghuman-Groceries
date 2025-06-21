import React, { useState } from 'react';
import { useCreditors } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import { format } from 'date-fns';
import { 
  Search, 
  User, 
  Calendar, 
  ShoppingBag,
  DollarSign,
  CreditCard,
  Eye,
  Trash2
} from 'lucide-react';

interface CreditorsListProps {
  onSelectCreditor: (creditorId: string) => void;
}

const CreditorsList: React.FC<CreditorsListProps> = ({ onSelectCreditor }) => {
  const { creditors, clearDebt } = useCreditors();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCreditors = creditors.filter(creditor =>
    creditor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.totalDebt - a.totalDebt);

  const handleClearAllDebt = async (creditorId: string, totalDebt: number) => {
    if (window.confirm('Are you sure you want to clear all debt for this creditor?')) {
      await clearDebt(creditorId, totalDebt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search creditors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Creditors List */}
      {filteredCreditors.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredCreditors.map((creditor) => (
              <div key={creditor.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{creditor.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <ShoppingBag className="h-4 w-4" />
                          <span>{creditor.purchases.length} purchases</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Since {format(new Date(creditor.createdAt), 'PP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(creditor.totalDebt)}
                      </p>
                      <p className="text-sm text-gray-600">Outstanding</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSelectCreditor(creditor.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => handleClearAllDebt(creditor.id, creditor.totalDebt)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No creditors found' : 'No creditors yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Credit sales will appear here when customers make purchases on credit'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditorsList;