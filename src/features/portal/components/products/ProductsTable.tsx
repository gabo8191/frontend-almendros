import React from 'react';
import { Package, Edit2, Settings } from 'lucide-react';
import { Product } from '../../api/product/types';
import Button from '../../../../shared/components/Button';
import Table from '../../../../shared/components/Table';
import ProductsPagination from './ProductsPagination';

interface ProductsTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  formatPrice: (price: number | string | null) => string;
  getCurrentPrices: (product: Product) => { selling: number; purchase: number };
  getStockStatus: (product: Product) => { status: string; color: string };
  handlePageChange: (page: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  currentPage,
  totalPages,
  totalItems,
  isAdmin,
  onEditProduct,
  onAdjustStock,
  formatPrice,
  getCurrentPrices,
  getStockStatus,
  handlePageChange,
}) => {
  const ActionButtons = ({ product }: { product: Product }) => (
    <div className="flex space-x-2">
        <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} onClick={() => onEditProduct(product)}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" icon={<Settings size={16} />} onClick={() => onAdjustStock(product)}>
          Ajustar Stock
        </Button>
    </div>
  );

  const columns: any[] = [
    {
      header: 'Producto',
      renderCell: (product: Product) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{product.category?.name || 'Sin categoría'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Actual',
      accessor: 'currentStock',
      cellClassName: 'text-sm text-gray-900',
    },
    {
      header: 'Precio Compra',
      renderCell: (product: Product) => formatPrice(getCurrentPrices(product).purchase),
    },
    {
      header: 'Precio Venta',
      renderCell: (product: Product) => formatPrice(getCurrentPrices(product).selling),
    },
    {
      header: 'Estado Stock',
      renderCell: (product: Product) => {
        const stock = getStockStatus(product);
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stock.color}`}>{stock.status}</span>;
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (product: Product) => (
        <div className="flex justify-center items-center h-full">
          <ActionButtons product={product} />
        </div>
      ),
    });
  }

  const renderMobileCard = (product: Product) => {
    const prices = getCurrentPrices(product);
    const stock = getStockStatus(product);
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <Package size={20} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-xs text-gray-500">{product.category?.name || 'Sin categoría'}</div>
          </div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stock.color}`}>{stock.status}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500">Stock: </span>
            <span className="text-gray-900 font-medium">{product.currentStock}</span>
          </div>
          <div>
            <span className="text-gray-500">P. Compra: </span>
            <span className="text-gray-900 font-medium">{formatPrice(prices.purchase)}</span>
          </div>
          <div>
            <span className="text-gray-500">P. Venta: </span>
            <span className="text-gray-900 font-medium">{formatPrice(prices.selling)}</span>
          </div>
        </div>
  
        {isAdmin && (
          <div className="flex justify-center items-center border-t pt-3 mt-3">
            <ActionButtons product={product} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Table
        columns={columns}
        data={products}
        rowKeyExtractor={(product) => product.id}
        renderMobileCard={renderMobileCard}
      />
      <ProductsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default ProductsTable;
