import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, AlertTriangle, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../../api/productService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';
import { useProductPrice } from './Hooks/useProductPrice';

// Price cell component to display the selling price
const SellingPriceCell: React.FC<{ productId: number }> = ({ productId }) => {
  const { sellingPrice, loading, error } = useProductPrice(productId);
  
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  if (loading) return <div className="text-sm text-gray-500">Cargando...</div>;
  if (error) return <div className="text-sm text-gray-500">No disponible</div>;
  
  return (
    <div className="text-sm font-medium text-gray-900">
      {formatPrice(sellingPrice)}
    </div>
  );
};

// Price cell component to display the purchase price
const PurchasePriceCell: React.FC<{ productId: number }> = ({ productId }) => {
  const { purchasePrice, loading, error } = useProductPrice(productId);
  
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  if (loading) return <div className="text-xs text-gray-500">Cargando...</div>;
  if (error) return <div className="text-xs text-gray-500">No disponible</div>;
  
  return (
    <div className="text-xs text-gray-500">
      Compra: {formatPrice(purchasePrice)}
    </div>
  );
};

const POSSystem: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts(currentPage, 10, {
        name: searchTerm || undefined,
        isActive: true,
      });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      showToast('error', 'Error al cargar los productos');
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const lowStock = await productService.getLowStockProducts();
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchLowStockProducts()]);
      setIsLoading(false);
    };
    loadData();
  }, [currentPage, searchTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    // Navigate to inventory movements page with product ID as state
    navigate('/portal/inventory', { 
      state: { 
        productId: product.id,
        productName: product.name 
      }
    });
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!productToEdit) return false;
    
    try {
      await productService.updateProduct(productToEdit.id, productData);
      showToast('success', 'Producto actualizado exitosamente');
      // Refresh both products and low stock data
      await Promise.all([fetchProducts(), fetchLowStockProducts()]);
      // Force refresh of price components by triggering a key change
      setProducts(prev => [...prev]);
      return true;
    } catch (error) {
      showToast('error', error.message || 'Error al actualizar el producto');
      throw error;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sistema POS</h1>
          <p className="text-gray-600 mt-1">Gestiona ventas y productos</p>
        </div>
        {isAdmin && (
          <div className="mt-4 md:mt-0">
            <Button 
              icon={<Plus size={16} />}
              onClick={() => setIsNewProductModalOpen(true)}
            >
              Nuevo Producto
            </Button>
          </div>
        )}
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="text-amber-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-amber-800">Productos con Bajo Stock</h3>
              <ul className="mt-2 space-y-1">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="text-sm text-amber-700">
                    {product.name} - Stock actual: {product.currentStock} (Mínimo: {product.minQuantity})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No hay resultados para tu búsqueda'
                : 'Aún no hay productos registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.currentStock} unidades</div>
                      <div className="text-xs text-gray-500">
                        Min: {product.minQuantity} / Max: {product.maxQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SellingPriceCell key={`selling-${product.id}-${product.updatedAt}`} productId={product.id} />
                      {isAdmin && (
                        <PurchasePriceCell key={`purchase-${product.id}-${product.updatedAt}`} productId={product.id} />
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={async (productData) => {
          try {
            await productService.createProduct(productData);
            showToast('success', 'Producto creado exitosamente');
            fetchProducts();
            return true;
          } catch (error) {
            showToast('error', error.message || 'Error al crear el producto');
            throw error;
          }
        }}
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

export default POSSystem;