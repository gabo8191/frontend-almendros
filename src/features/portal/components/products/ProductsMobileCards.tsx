import React from 'react';
import { Edit, Zap } from 'lucide-react';
import { Product } from '../../api/product/types';
import Button from '../../../../shared/components/Button';

interface ProductsMobileCardsProps {
  products: Product[];
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  formatPrice: (price: number | string | null) => string;
  getCurrentPrices: (product: Product) => { selling: number; purchase: number };
  getStockStatus: (product: Product) => { status: string; color: string };
}

const ProductsMobileCards: React.FC<ProductsMobileCardsProps> = ({
  products,
  isAdmin,
  onEditProduct,
  onAdjustStock,
  formatPrice,
  getCurrentPrices,
  getStockStatus,
}) => {
  return (
    <div className="lg:hidden space-y-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        const prices = getCurrentPrices(product);
        
        return (
          <div key={product.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}>
                  {product.currentStock} unidades
                </span>
                <div className="text-xs text-gray-500">
                  Min: {product.minQuantity} / Max: {product.maxQuantity}
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(prices.selling)}
                </div>
                {isAdmin && (
                  <div className="text-xs text-gray-500">
                    Compra: {formatPrice(prices.purchase)}
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex space-x-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Edit size={14} />}
                  onClick={() => onEditProduct(product)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Zap size={14} />}
                  onClick={() => onAdjustStock(product)}
                  className="flex-1"
                >
                  Stock
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductsMobileCards;
