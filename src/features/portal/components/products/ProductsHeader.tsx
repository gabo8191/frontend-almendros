import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../../shared/components/Button';

interface ProductsHeaderProps {
  totalItems: number;
  isAdmin: boolean;
  onNewProduct: () => void;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  totalItems,
  isAdmin,
  onNewProduct,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h1>
        <p className="text-gray-600 mt-1">
          Administra el inventario de productos ({totalItems} productos totales)
        </p>
      </div>
      {isAdmin && (
        <div className="mt-4 md:mt-0">
          <Button icon={<Plus size={16} />} onClick={onNewProduct}>
            Nuevo Producto
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsHeader;
