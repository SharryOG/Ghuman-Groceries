import React, { useState } from 'react';
import { useSales, useProducts } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star,
  ShoppingCart,
  CreditCard,
  BarChart3
} from 'lucide-react';

const SalesAnalytics: React.FC = () => {
  const { sales } = useSales();
  const { products } = useProducts();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const start = startOfDay(new Date(dateRange.start));
    const end = endOfDay(new Date(dateRange.end));
    return isWithinInterval(saleDate, { start, end });
  });

  // Calculate metrics
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = filteredSales.filter(sale => sale.paymentType === 'cash').reduce((sum, sale) => sum + sale.total, 0);
  const creditSales = filteredSales.filter(sale => sale.paymentType === 'credit').reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  // Calculate profit (if purchase price is available)
  const totalProfit = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.purchasePrice) {
        return itemSum + ((item.pricePerUnit - product.purchasePrice) * item.quantity);
      }
      return itemSum;
    }, 0);
  }, 0);

  // Most sold products
  const productSales = filteredSales.flatMap(sale => sale.items);
  const productStats = productSales.reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = {
        name: item.productName,
        quantity: 0,
        revenue: 0
      };
    }
    acc[item.productId].quantity += item.quantity;
    acc[item.productId].revenue += item.total;
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily sales for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const daysSales = filteredSales.filter(sale => 
      format(new Date(sale.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'MMM dd'),
      sales: daysSales.reduce((sum, sale) => sum + sale.total, 0),
      count: daysSales.length
    };
  }).reverse();

  const maxDailySales = Math.max(...last7Days.map(day => day.sales));

  return (
    <div className="space-y-8">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Sales Analytics</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Sale</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageSale)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-600">{filteredSales.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Cash Sales</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-600">{formatCurrency(cashSales)}</span>
                <div className="text-sm text-gray-500">
                  {totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 0}%
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">Credit Sales</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-orange-600">{formatCurrency(creditSales)}</span>
                <div className="text-sm text-gray-500">
                  {totalSales > 0 ? Math.round((creditSales / totalSales) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-700 text-sm">{product.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
                  <div className="text-xs text-gray-500">{product.quantity} units</div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-gray-500 text-sm">No sales data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Sales (Last 7 Days)</h3>
        <div className="space-y-4">
          {last7Days.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">{day.date}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-8 rounded-full flex items-center justify-end pr-3"
                  style={{
                    width: maxDailySales > 0 ? `${(day.sales / maxDailySales) * 100}%` : '0%',
                    minWidth: day.sales > 0 ? '60px' : '0px'
                  }}
                >
                  {day.sales > 0 && (
                    <span className="text-white text-sm font-medium">
                      {formatCurrency(day.sales)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {day.count} sales
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;