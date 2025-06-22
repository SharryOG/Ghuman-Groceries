import React, { useState } from 'react';
import { useProducts } from '../../hooks/useDatabase';
import { formatCurrency, calculatePriceForQuantity } from '../../utils/calculations';
import { 
  DollarSign, 
  Package, 
  Search, 
  Filter,
  Edit3,
  Save,
  X
} from 'lucide-react';

const PricingTab: React.FC = () => {
  const { products, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'units' | 'kg'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || product.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleEditPrice = (product: any) => {
    setEditingId(product.id);
    setEditPrice(product.salePrice.toString());
  };

  const handleSavePrice = async (productId: string) => {
    const newPrice = parseFloat(editPrice);
    if (newPrice > 0) {
      await updateProduct(productId, { salePrice: newPrice });
      setEditingId(null);
      setEditPrice('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const getPriceBreakdown = (product: any) => {
    if (product.type === 'units') {
      return [
        { label: '1 Unit', price: product.salePrice }
      ];
    } else {
      return [
        { label: '1kg', price: product.salePrice },
        { label: '500g (Adha Kilo)', price: calculatePriceForQuantity(product.salePrice, 500) },
        { label: '250g (Paiya)', price: calculatePriceForQuantity(product.salePrice, 250) },
        { label: '120g (Adh Pa)', price: calculatePriceForQuantity(product.salePrice, 120) }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Pricing</h1>
          <p className="text-gray-600">Manage product prices and view pricing breakdowns</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="units">Units Only</option>
                <option value="kg">Weight Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Pricing List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const priceBreakdown = getPriceBreakdown(product);
                    const isEditing = editingId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                Type: {product.type === 'units' ? 'Units' : 'Weight (kg)'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                step="0.01"
                                min="0"
                              />
                              <button
                                onClick={() => handleSavePrice(product.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-gray-900">
                                {formatCurrency(product.salePrice)}
                              </span>
                              <span className="text-sm text-gray-500">
                                per {product.type === 'units' ? 'unit' : 'kg'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-2">
                            {priceBreakdown.map((breakdown, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {breakdown.label}
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  {formatCurrency(breakdown.price)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!isEditing && (
                            <button
                              onClick={() => handleEditPrice(product)}
                              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span>Edit Price</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingTab;