import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Product } from '../../api/product/types';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import ProductsSearch from './ProductsSearch';
import ProductsDesktopTable from './ProductsDesktopTable';
import ProductsMobileCards from './ProductsMobileCards';
import ProductsPagination from './ProductsPagination';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onNewProduct: () => void;
  formatPrice: (price: number | string | null) => string;
  getCurrentPrices: (product: Product) => { selling: number; purchase: number };
  getStockStatus: (product: Product) => { status: string; color: string };
  handlePageChange: (page: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading,
  searchTerm,
  setSearchTerm,
  currentPage,
  totalPages,
  totalItems,
  isAdmin,
  onEditProduct,
  onAdjustStock,
  onNewProduct,
  formatPrice,
  getCurrentPrices,
  getStockStatus,
  handlePageChange,
}) => {
  const EmptyState = () => (
    <div className="text-center py-12">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron productos
      </h3>
      <p className="text-gray-600">
        {searchTerm
          ? 'No hay resultados para tu búsqueda'
          : 'Aún no hay productos registrados'}
      </p>
      {isAdmin && !searchTerm && (
        <Button className="mt-4" icon={<Plus size={16} />} onClick={onNewProduct}>
          Crear primer producto
        </Button>
      )}
    </div>
  );

  const LoadingState = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando productos...</p>
    </div>
  );

  return (
    <Card>
      <ProductsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {isLoading ? <LoadingState /> : 
       products.length === 0 ? <EmptyState /> : (
        <>
          <ProductsDesktopTable
            products={products}
            isAdmin={isAdmin}
            onEditProduct={onEditProduct}
            onAdjustStock={onAdjustStock}
            formatPrice={formatPrice}
            getCurrentPrices={getCurrentPrices}
            getStockStatus={getStockStatus}
          />

          <ProductsMobileCards
            products={products}
            isAdmin={isAdmin}
            onEditProduct={onEditProduct}
            onAdjustStock={onAdjustStock}
            formatPrice={formatPrice}
            getCurrentPrices={getCurrentPrices}
            getStockStatus={getStockStatus}
          />

          <ProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </Card>
  );
};

export default ProductsTable;
