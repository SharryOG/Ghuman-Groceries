import React, { useState } from 'react';
import { useProducts } from '../../hooks/useDatabase';
import { Package, Upload, Save, X } from 'lucide-react';

interface ProductFormProps {
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  const { addProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    salePrice: '',
    purchasePrice: '',
    type: 'kg' as 'kg' | 'units',
    quantity: '',
    minQuantity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.salePrice) return;

    setLoading(true);
    try {
      await addProduct({
        name: formData.name,
        image: formData.image || undefined,
        salePrice: parseFloat(formData.salePrice),
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        type: formData.type,
        quantity: parseFloat(formData.quantity) || 0,
        minQuantity: parseFloat(formData.minQuantity) || 5
      });

      setFormData({
        name: '',
        image: '',
        salePrice: '',
        purchasePrice: '',
        type: 'kg',
        quantity: '',
        minQuantity: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Package className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Basmati Rice"
            />
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Image URL"
              />
              <button
                type="button"
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price (₹) *
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Price (₹)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="units">Units</option>
            </select>
          </div>

          {/* Current Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* Minimum Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Quantity Alert
            </label>
            <input
              type="number"
              name="minQuantity"
              value={formData.minQuantity}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
          </div>
        </div>

        {/* Product Preview */}
        {formData.image && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="flex items-center space-x-4">
              <img
                src={formData.image}
                alt={formData.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <p className="font-medium text-gray-900">{formData.name || 'Product Name'}</p>
                <p className="text-sm text-gray-600">
                  ₹{formData.salePrice || '0.00'} per {formData.type}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.salePrice}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 inline mr-2" />
                Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;