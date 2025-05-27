import React from 'react';
import { Trash2, Search, AlertCircle } from 'lucide-react';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';

interface Product {
  id: number;
  name: string;
  description: string;
  currentStock: number;
  isActive: boolean;
  prices?: Array<{
    id: number;
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
  }>;
  purchasePrice?: number;
  sellingPrice?: number;
}

interface SaleDetail {
  productId: number;
  productName?: string;
  currentStock?: number;
  sellingPrice?: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

interface ProductDetailItemProps {
  index: number;
  detail: SaleDetail;
  searchTerm: string;
  selectedProduct: Product | undefined;
  filteredProducts: Product[];
  errors: Record<string, string>;
  onRemove: (index: number) => void;
  onProductSelection: (index: number, productId: number) => void;
  onDetailChange: (index: number, field: keyof SaleDetail, value: number) => void;
  onSearchChange: (index: number, value: string) => void;
  onProductClear: (index: number) => void;
  formatPrice: (price: number | null | undefined) => string;
  getCurrentPrices: (product: Product) => { selling: number; purchase: number };
  calculateDetailSubtotal: (detail: SaleDetail) => number;
}

const ProductDetailItem: React.FC<ProductDetailItemProps> = ({
  index,
  detail,
  searchTerm,
  selectedProduct,
  filteredProducts,
  errors,
  onRemove,
  onProductSelection,
  onDetailChange,
  onSearchChange,
  onProductClear,
  formatPrice,
  getCurrentPrices,
  calculateDetailSubtotal,
}) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">Producto #{index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Trash2 size={16} />}
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800"
        />
      </div>

      {/* Product Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar producto
        </label>
        {selectedProduct ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <div className="font-medium">{selectedProduct.name}</div>
              <div className="text-sm text-gray-500">
                Stock: {selectedProduct.currentStock} |
                Precio: {formatPrice(getCurrentPrices(selectedProduct).selling)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onProductClear(index)}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <Input
              placeholder="Escribe para buscar productos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(index, e.target.value)}
              icon={<Search size={18} />}
            />
            {(searchTerm || filteredProducts.length > 0) && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const prices = getCurrentPrices(product);
                    return (
                      <div
                        key={product.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          product.currentStock < 1 ? 'opacity-50' : ''
                        }`}
                        onClick={() => product.currentStock > 0 && onProductSelection(index, product.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              Stock: {product.currentStock} |
                              Precio: {formatPrice(prices.selling)}
                            </div>
                          </div>
                          {product.currentStock < 5 && product.currentStock > 0 && (
                            <span className="text-amber-600 flex items-center text-xs">
                              <AlertCircle size={12} className="mr-1" /> Bajo stock
                            </span>
                          )}
                          {product.currentStock < 1 && (
                            <span className="text-red-600 text-xs">Sin stock</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {errors[`product_${index}`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`product_${index}`]}</p>
        )}
      </div>

      {/* Product Details */}
      {detail.productId > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Cantidad *"
              min="1"
              max={detail.currentStock}
              value={detail.quantity || ''}
              onChange={(e) => onDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
              error={errors[`quantity_${index}`]}
            />
            <Input
              type="number"
              label="Precio Unitario *"
              step="0.01"
              min="0"
              value={detail.unitPrice || ''}
              readOnly={true}
              error={errors[`unitPrice_${index}`]}
              className="bg-gray-100"
            />
            <Input
              type="number"
              label="Descuento"
              step="0.01"
              min="0"
              max={detail.quantity * detail.unitPrice}
              value={detail.discountAmount || ''}
              onChange={(e) => onDetailChange(index, 'discountAmount', parseFloat(e.target.value) || 0)}
              error={errors[`discount_${index}`]}
            />
          </div>
          
          {/* Stock Warning */}
          {detail.currentStock !== undefined && detail.currentStock < 5 && detail.currentStock > 0 && (
            <div className="flex items-center p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">
                ¡Atención! Este producto tiene poco stock ({detail.currentStock} unidades)
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="font-semibold text-lg">
              {formatPrice(calculateDetailSubtotal(detail))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailItem;
