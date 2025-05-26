import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, AlertTriangle, Edit, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/productService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';

// Updated Product interface to match API response
interface Product {
  id: number;
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  supplierId: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prices?: Array<{
    id: number;
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
  }>;
  // Fallback properties if they exist
  purchasePrice?: number;
  sellingPrice?: number;
}

const POSSystem: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
      setIsLoading(true);
      const response = await productService.getProducts(currentPage, 12, {
        name: searchTerm || undefined,
        isActive: true,
      });
      
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast('error', 'Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.status === 429) {
        showToast('warning', 'Demasiadas solicitudes. Reintentando en unos segundos...');
        setTimeout(() => fetchProducts(), 3000);
        return;
      } else {
        showToast('error', error.message || 'Error al cargar los productos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const lowStock = await productService.getLowStockProducts();
      setLowStockProducts(lowStock);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 429) {
        // Ignore auth/rate limit errors for low stock - not critical
        return;
      }
      console.warn('Error loading low stock products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Delay low stock fetch to avoid hitting rate limits
    const timer = setTimeout(() => fetchLowStockProducts(), 1000);
    return () => clearTimeout(timer);
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchProducts();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const formatPrice = (price: number | string | null) => {
    if (price === null || price === undefined) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(numPrice);
  };

  // Extract current prices from the prices array
  const getCurrentPrices = (product: Product) => {
    // Check if product has prices array
    if (product.prices && Array.isArray(product.prices) && product.prices.length > 0) {
      // Find current price (isCurrentPrice: true) or use the first one
      const currentPrice = product.prices.find(p => p.isCurrentPrice) || product.prices[0];
      return {
        selling: currentPrice.sellingPrice,
        purchase: currentPrice.purchasePrice
      };
    }
    
    // Fallback to direct properties if they exist
    return {
      selling: product.sellingPrice,
      purchase: product.purchasePrice
    };
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) return { status: 'critical', color: 'text-red-600 bg-red-50 border-red-200' };
    if (product.currentStock <= product.minQuantity) return { status: 'low', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (product.currentStock >= product.maxQuantity) return { status: 'high', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { status: 'normal', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditProductModalOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    navigate('/portal/inventory', { 
      state: { 
        productId: product.id,
        productName: product.name 
      }
    });
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      showToast('success', 'Producto creado exitosamente');
      await fetchProducts();
      setTimeout(() => fetchLowStockProducts(), 500);
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear el producto');
      throw error;
    }
  };

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!productToEdit) return false;
    
    try {
      await productService.updateProduct(productToEdit.id, productData);
      showToast('success', 'Producto actualizado exitosamente');
      await fetchProducts();
      setTimeout(() => fetchLowStockProducts(), 500);
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar el producto');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sistema POS</h1>
          <p className="text-gray-600 mt-1">
            Gestiona ventas y productos ({totalItems} productos totales)
          </p>
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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
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
      )}

      {/* Products Section */}
      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar productos por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
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
              <Button 
                className="mt-4"
                icon={<Plus size={16} />}
                onClick={() => setIsNewProductModalOpen(true)}
              >
                Crear primer producto
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
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
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
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
                                onClick={() => handleEditProduct(product)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Zap size={14} />}
                                onClick={() => handleAdjustStock(product)}
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

            {/* Tablet & Mobile Card View */}
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
                          onClick={() => handleEditProduct(product)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Zap size={14} />}
                          onClick={() => handleAdjustStock(product)}
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
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-6 border-t space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Página {currentPage} de {totalPages} ({totalItems} productos)
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
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

export default POSSystem;