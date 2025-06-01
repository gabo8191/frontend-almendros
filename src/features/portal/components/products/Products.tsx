import React, { useState } from 'react';
import { Product } from '../../api/product/types';
import { Package, Plus, Search } from 'lucide-react';
import ProductsHeader from './ProductsHeader';
import LowStockAlert from './LowStockAlert';
import ProductsTable from './ProductsTable';
import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';
import { useProducts } from './Hooks/useProducts';
import Card from '../../../../shared/components/Card';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import Spinner from '../../../../shared/components/Spinner';

const Products: React.FC = () => {
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const productsData = useProducts();

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  };

  const handleCreateProduct = async (productData: any) => {
    const success = await productsData.createProduct(productData);
    if (success) {
      setIsNewProductModalOpen(false);
    }
  };

  const handleUpdateProduct = async (productData: any): Promise<boolean> => {
    if (!productToEdit) return false;
    
    const success = await productsData.updateProduct(productToEdit.id, productData);
    if (success) {
      setIsEditProductModalOpen(false);
      setProductToEdit(null);
    }
    return success;
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron productos
      </h3>
      <p className="text-gray-600">
        {productsData.searchTerm
          ? 'No hay resultados para tu búsqueda'
          : 'Aún no hay productos registrados'}
      </p>
      {productsData.isAdmin && !productsData.searchTerm && (
        <Button className="mt-4" icon={<Plus size={16} />} onClick={() => setIsNewProductModalOpen(true)}>
          Crear primer producto
        </Button>
      )}
    </div>
  );

  const LoadingState = () => (
    <div className="text-center py-12">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-gray-600">Cargando productos...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <ProductsHeader
        totalItems={productsData.totalItems}
        isAdmin={productsData.isAdmin}
        onNewProduct={() => setIsNewProductModalOpen(true)}
        onRefresh={productsData.refreshProducts}
        isLoading={productsData.isLoading}
      />

      <LowStockAlert lowStockProducts={productsData.lowStockProducts} />

      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar productos..."
            value={productsData.searchTerm}
            onChange={(e) => productsData.setSearchTerm(e.target.value)}
          />
        </div>

        {productsData.isLoading ? <LoadingState /> : 
         productsData.products.length === 0 ? <EmptyState /> : (
          <ProductsTable
            products={productsData.products}
            currentPage={productsData.currentPage}
            totalPages={productsData.totalPages}
            totalItems={productsData.totalItems}
            isAdmin={productsData.isAdmin}
            onEditProduct={handleEditProduct}
            onAdjustStock={productsData.handleAdjustStock}
            formatPrice={productsData.formatPrice}
            getCurrentPrices={productsData.getCurrentPrices}
            getStockStatus={productsData.getStockStatus}
            handlePageChange={productsData.handlePageChange}
          />
        )}
      </Card>

      {/* Modals */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={handleCreateProduct}
      />

      {productToEdit && (
        <EditProductModal
          isOpen={isEditProductModalOpen}
          onClose={() => {
            setIsEditProductModalOpen(false);
            setProductToEdit(null);
          }}
          product={productToEdit}
          onSave={handleUpdateProduct}
        />
      )}
    </div>
  );
};

export default Products;
