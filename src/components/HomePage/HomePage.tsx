import React from 'react';
import { useProducts, useSales, useCreditors, useRestockItems, usePayments } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
import { TabType } from '../../types';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle, 
  IndianRupee,
  ShoppingCart,
  Calendar,
  Star,
  CreditCard,
  QrCode,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface HomePageProps {
  onTabChange: (tab: TabType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onTabChange }) => {
  const { products } = useProducts();
  const { sales } = useSales();
  const { creditors } = useCreditors();
  const { restockItems } = useRestockItems();
  const { payments } = usePayments();

  // Calculate dashboard metrics
  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDebt = creditors.reduce((sum, creditor) => sum + creditor.totalDebt, 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minQuantity).length;
  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  ).reduce((sum, sale) => sum + sale.total, 0);
  const todayPayments = payments.filter(payment => 
    new Date(payment.date).toDateString() === new Date().toDateString()
  ).reduce((sum, payment) => sum + payment.amount, 0);

  // Most sold item
  const itemSales = sales.flatMap(sale => sale.items);
  const productSales = itemSales.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const mostSoldProduct = products.find(p => 
    p.id === Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b, Object.keys(productSales)[0]
    )
  );

  const stats = [
    {
      name: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      action: () => onTabChange('inventory')
    },
    {
      name: 'Today\'s Sales',
      value: formatCurrency(todaySales),
      icon: IndianRupee,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      action: () => onTabChange('sales')
    },
    {
      name: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      action: () => onTabChange('analytics')
    },
    {
      name: 'Pending Debt',
      value: formatCurrency(totalDebt),
      icon: Users,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      action: () => onTabChange('creditors')
    },
    {
      name: 'Low Stock Items',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      action: () => onTabChange('inventory')
    },
    {
      name: 'Restock Items',
      value: restockItems.length,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      action: () => onTabChange('inventory')
    },
    {
      name: 'Today\'s Payments',
      value: formatCurrency(todayPayments),
      icon: CreditCard,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      action: () => onTabChange('payments')
    },
    {
      name: 'Total Payments',
      value: payments.length,
      icon: QrCode,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      action: () => onTabChange('payments')
    }
  ];

  const quickActions = [
    {
      label: 'Add Product',
      icon: Package,
      color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      action: () => onTabChange('inventory')
    },
    {
      label: 'New Sale',
      icon: ShoppingCart,
      color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      action: () => onTabChange('sales')
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      action: () => onTabChange('analytics')
    },
    {
      label: 'Manage Creditors',
      icon: Users,
      color: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      action: () => onTabChange('creditors')
    },
    {
      label: 'Generate QR',
      icon: QrCode,
      color: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30',
      textColor: 'text-teal-600 dark:text-teal-400',
      action: () => onTabChange('payments')
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 sm:p-8 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Ghuman Groceries</h2>
        <p className="text-blue-100 text-sm sm:text-base">Comprehensive store management at your fingertips</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              onClick={stat.action}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{stat.name}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${stat.textColor} dark:${stat.textColor.replace('text-', 'text-')} truncate`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.color} ml-2 flex-shrink-0`}>
                  <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Sold Product */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Sold Product</h3>
          </div>
          {mostSoldProduct ? (
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{mostSoldProduct.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sold: {productSales[mostSoldProduct.id] || 0} {mostSoldProduct.type}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Price: {formatCurrency(mostSoldProduct.salePrice)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {sales.slice(-3).reverse().map((sale) => (
              <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {sale.buyerName || 'Cash Sale'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(sale.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
                  <p className={`text-xs ${sale.paymentType === 'credit' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                    {sale.paymentType}
                  </p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent sales</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button 
                key={action.label}
                onClick={action.action}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2 p-3 sm:p-4 rounded-lg transition-colors ${action.color}`}
              >
                <Icon className={`h-5 w-5 ${action.textColor}`} />
                <span className={`font-medium text-xs sm:text-sm text-center sm:text-left ${action.textColor}`}>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;