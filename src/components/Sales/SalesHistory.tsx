import React, { useState } from 'react';
import { useSales } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import { format } from 'date-fns';
import { 
  Calendar, 
  User, 
  DollarSign, 
  CreditCard, 
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'cash' | 'credit'>('all');
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || sale.paymentType === filter;
    
    const matchesDate = (!dateRange.start || new Date(sale.date) >= new Date(dateRange.start)) &&
                       (!dateRange.end || new Date(sale.date) <= new Date(dateRange.end));
    
    return matchesSearch && matchesFilter && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = filteredSales.filter(sale => sale.paymentType === 'cash').reduce((sum, sale) => sum + sale.total, 0);
  const creditSales = filteredSales.filter(sale => sale.paymentType === 'credit').reduce((sum, sale) => sum + sale.total, 0);

  const toggleSaleDetails = (saleId: string) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash Only</option>
              <option value="credit">Credit Only</option>
            </select>
          </div>
          
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Sales</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(cashSales)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credit Sales</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(creditSales)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredSales.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(sale.date), 'PPP')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(sale.date), 'p')}
                        </span>
                      </div>
                      {sale.buyerName && (
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{sale.buyerName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(sale.total)}</p>
                      <div className="flex items-center space-x-2">
                        {sale.paymentType === 'cash' ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-orange-600" />
                        )}
                        <span className={`text-sm ${
                          sale.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {sale.paymentType}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleSaleDetails(sale.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedSale === sale.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedSale === sale.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Items Sold:</h4>
                    <div className="space-y-2">
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{item.productName}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {item.quantity} {item.type} × {formatCurrency(item.pricePerUnit)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;