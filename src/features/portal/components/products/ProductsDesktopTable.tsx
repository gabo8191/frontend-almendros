import React from 'react';
import { Edit, Zap } from 'lucide-react';
import { Product } from '../../api/product/types';
import Button from '../../../../shared/components/Button';

interface ProductsDesktopTableProps {
  products: Product[];
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  formatPrice: (price: number | string | null) => string;
  getCurrentPrices: (product: Product) => { selling: number; purchase: number };
  getStockStatus: (product: Product) => { status: string; color: string };
}

const ProductsDesktopTable: React.FC<ProductsDesktopTableProps> = ({
  products,
  isAdmin,
  onEditProduct,
  onAdjustStock,
  formatPrice,
  getCurrentPrices,
  getStockStatus,
}) => {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio de Venta
            </th>
            {isAdmin && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio de Compra
              </th>
            )}
            {isAdmin && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const prices = getCurrentPrices(product);
            
            return (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}>
                      {product.currentStock} unidades
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Min: {product.minQuantity} / Max: {product.maxQuantity}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPrice(prices.selling)}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {formatPrice(prices.purchase)}
                    </div>
                  </td>
                )}
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Edit size={14} />}
                        onClick={() => onEditProduct(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Zap size={14} />}
                        onClick={() => onAdjustStock(product)}
                      >
                        Stock
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsDesktopTable;
