import React, { useState } from 'react';
import { Product } from '../../api/product/types';
import ProductsHeader from './ProductsHeader';
import LowStockAlert from './LowStockAlert';
import ProductsTable from './ProductsTable';
import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';
import { useProducts } from './Hooks/useProducts';

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

  return (
    <div className="space-y-6">
      <ProductsHeader
        totalItems={productsData.totalItems}
        isAdmin={productsData.isAdmin}
        onNewProduct={() => setIsNewProductModalOpen(true)}
      />

      <LowStockAlert lowStockProducts={productsData.lowStockProducts} />

      <ProductsTable
        products={productsData.products}
        isLoading={productsData.isLoading}
        searchTerm={productsData.searchTerm}
        setSearchTerm={productsData.setSearchTerm}
        currentPage={productsData.currentPage}
        totalPages={productsData.totalPages}
        totalItems={productsData.totalItems}
        isAdmin={productsData.isAdmin}
        onEditProduct={handleEditProduct}
        onAdjustStock={productsData.handleAdjustStock}
        onNewProduct={() => setIsNewProductModalOpen(true)}
        formatPrice={productsData.formatPrice}
        getCurrentPrices={productsData.getCurrentPrices}
        getStockStatus={productsData.getStockStatus}
        handlePageChange={productsData.handlePageChange}
      />

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
