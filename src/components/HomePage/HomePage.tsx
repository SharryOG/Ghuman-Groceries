import React from 'react';
import { useProducts, useSales, useCreditors, useRestockItems, usePayments } from '../../hooks/useDatabase';
import { formatCurrency } from '../../utils/calculations';
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
  QrCode
} from 'lucide-react';

const HomePage: React.FC = () => {
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
      textColor: 'text-blue-600'
    },
    {
      name: 'Today\'s Sales',
      value: formatCurrency(todaySales),
      icon: IndianRupee,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Total Sales',
      value: formatCurrency(totalSales),
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      name: 'Pending Debt',
      value: formatCurrency(totalDebt),
      icon: Users,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      name: 'Low Stock Items',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'Restock Items',
      value: restockItems.length,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Today\'s Payments',
      value: formatCurrency(todayPayments),
      icon: CreditCard,
      color: 'bg-teal-500',
      textColor: 'text-teal-600'
    },
    {
      name: 'Total Payments',
      value: payments.length,
      icon: QrCode,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Ghuman Groceries</h2>
        <p className="text-blue-100">Comprehensive store management at your fingertips</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold Product */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Most Sold Product</h3>
          </div>
          {mostSoldProduct ? (
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">{mostSoldProduct.name}</p>
              <p className="text-sm text-gray-600">
                Sold: {productSales[mostSoldProduct.id] || 0} {mostSoldProduct.type}
              </p>
              <p className="text-sm text-gray-600">
                Price: {formatCurrency(mostSoldProduct.salePrice)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {sales.slice(-3).reverse().map((sale) => (
              <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium">
                    {sale.buyerName || 'Cash Sale'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                  <p className={`text-xs ${sale.paymentType === 'credit' ? 'text-orange-600' : 'text-green-600'}`}>
                    {sale.paymentType}
                  </p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-gray-500 text-sm">No recent sales</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Add Product</span>
          </button>
          <button className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">New Sale</span>
          </button>
          <button className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-purple-600 font-medium">View Analytics</span>
          </button>
          <button className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-orange-600 font-medium">Manage Creditors</span>
          </button>
          <button className="flex items-center space-x-2 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
            <CreditCard className="h-5 w-5 text-teal-600" />
            <span className="text-teal-600 font-medium">Generate QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;