import React, { useState } from 'react';
import { useProducts, useSales, useRestockItems } from '../../hooks/useDatabase';
import { formatCurrency, calculatePriceForQuantity, calculateQuantityForPrice } from '../../utils/calculations';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  CreditCard, 
  DollarSign,
  Package,
  AlertTriangle
} from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  type: 'units' | 'kg';
}

const SalesInterface: React.FC = () => {
  const { products } = useProducts();
  const { addSale } = useSales();
  const { addRestockItem } = useRestockItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [buyerName, setBuyerName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [customQuantity, setCustomQuantity] = useState<{[key: string]: string}>({});
  const [customPrice, setCustomPrice] = useState<{[key: string]: string}>({});

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: any, quantity: number, customPriceValue?: number) => {
    if (quantity <= 0) return;
    
    const pricePerUnit = customPriceValue || product.salePrice;
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * pricePerUnit }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity,
        pricePerUnit,
        total: quantity * pricePerUnit,
        type: product.type
      }]);
    }
    
    // Clear custom inputs
    setCustomQuantity({});
    setCustomPrice({});
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.pricePerUnit }
          : item
      ));
    }
  };

  const handlePriceToQuantity = (product: any, targetPrice: number) => {
    if (product.type === 'kg') {
      const quantity = calculateQuantityForPrice(product.salePrice, targetPrice);
      handleAddToCart(product, quantity);
    }
  };

  const handleCustomQuantityAdd = (product: any) => {
    const quantity = parseFloat(customQuantity[product.id] || '0');
    if (quantity > 0) {
      handleAddToCart(product, quantity);
    }
  };

  const handleCustomPriceAdd = (product: any) => {
    const price = parseFloat(customPrice[product.id] || '0');
    if (price > 0 && product.type === 'kg') {
      const quantity = calculateQuantityForPrice(product.salePrice, price);
      handleAddToCart(product, quantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentType === 'credit' && !buyerName.trim()) {
      alert('Buyer name is required for credit sales');
      return;
    }

    const sale = {
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        total: item.total,
        type: item.type
      })),
      total: cart.reduce((sum, item) => sum + item.total, 0),
      buyerName: buyerName.trim() || undefined,
      paymentType,
      date: new Date(),
      isPaid: paymentType === 'cash'
    };

    await addSale(sale);
    
    // Check for low stock and add to restock list
    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (product && product.quantity - cartItem.quantity <= product.minQuantity) {
        addRestockItem({
          productId: product.id,
          productName: product.name,
          quantity: Math.max(product.minQuantity * 2, 10),
          isCustom: false,
          priority: product.quantity - cartItem.quantity === 0 ? 'high' : 'medium'
        });
      }
    });

    // Reset
    setCart([]);
    setBuyerName('');
    setPaymentType('cash');
    setShowCheckout(false);
    alert('Sale completed successfully!');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Products List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{formatCurrency(product.salePrice)} per {product.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock:</p>
                  <p className={`font-medium ${
                    product.quantity <= product.minQuantity ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {product.quantity} {product.type}
                  </p>
                </div>
              </div>

              {product.quantity <= product.minQuantity && (
                <div className="flex items-center space-x-2 mb-4 p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">Low Stock Alert</span>
                </div>
              )}

              {/* Quick Add Buttons */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddToCart(product, 1)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    +1 {product.type}
                  </button>
                  {product.type === 'kg' && (
                    <>
                      <button
                        onClick={() => handleAddToCart(product, 0.5)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        +0.5kg
                      </button>
                      <button
                        onClick={() => handleAddToCart(product, 0.25)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        +0.25kg
                      </button>
                    </>
                  )}
                </div>

                {/* Custom Quantity */}
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder={`Custom ${product.type}`}
                    value={customQuantity[product.id] || ''}
                    onChange={(e) => setCustomQuantity({...customQuantity, [product.id]: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    step={product.type === 'kg' ? '0.01' : '1'}
                    min="0"
                  />
                  <button
                    onClick={() => handleCustomQuantityAdd(product)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Price to Quantity (for kg products) */}
                {product.type === 'kg' && (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Enter price ₹"
                      value={customPrice[product.id] || ''}
                      onChange={(e) => setCustomPrice({...customPrice, [product.id]: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={() => handleCustomPriceAdd(product)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
        <div className="flex items-center space-x-2 mb-6">
          <ShoppingCart className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Cart</h2>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {cart.length}
          </span>
        </div>

        {cart.length > 0 ? (
          <>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.pricePerUnit)} × {item.quantity} {item.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - (item.type === 'kg' ? 0.1 : 1))}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + (item.type === 'kg' ? 0.1 : 1))}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Payment Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentType('cash')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    paymentType === 'cash'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Cash</span>
                </button>
                <button
                  onClick={() => setPaymentType('credit')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    paymentType === 'credit'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Credit</span>
                </button>
              </div>
            </div>

            {/* Buyer Name */}
            {paymentType === 'credit' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter buyer name"
                    required
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={paymentType === 'credit' && !buyerName.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Complete Sale
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add products to start a sale</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInterface;