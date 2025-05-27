import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../../api/product/types';
import Card from '../../../../shared/components/Card';

interface LowStockAlertProps {
  lowStockProducts: Product[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ lowStockProducts }) => {
  if (lowStockProducts.length === 0) return null;

  return (
    <Card className="bg-amber-50 border-amber-200">
      <div className="flex items-start">
        <AlertTriangle className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-amber-800">
            Productos con Bajo Stock ({lowStockProducts.length})
          </h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="text-sm text-amber-700 bg-white rounded p-2 border border-amber-200">
                <div className="font-medium truncate">{product.name}</div>
                <div className="text-xs">
                  Stock: {product.currentStock} / Mínimo: {product.minQuantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LowStockAlert;
