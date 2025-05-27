import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../../api/product';
import { Product } from '../../../api/product/types';
import { useToast } from '../../../../../shared/context/ToastContext';
import { useAuth } from '../../../../auth/context/AuthContext';
import { Role } from '../../../../auth/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

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
      if (error.response?.status === 401) {
        return;
      }
    }
  };

  const createProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      showToast('success', 'Producto creado exitosamente');
      await fetchProducts();
      setTimeout(() => fetchLowStockProducts(), 500);
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear el producto');
      return false;
    }
  };

  const updateProduct = async (productId: number, productData: any) => {
    try {
      await productService.updateProduct(productId, productData);
      showToast('success', 'Producto actualizado exitosamente');
      await fetchProducts();
      setTimeout(() => fetchLowStockProducts(), 500);
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar el producto');
      return false;
    }
  };

  const handleEditProduct = (product: Product) => {
    return product;
  };

  const handleAdjustStock = (product: Product) => {
    navigate('/portal/inventory', { 
      state: { 
        productId: product.id,
        productName: product.name 
      }
    });
  };

  const formatPrice = (price: number | string | null) => {
    if (price === null || price === undefined) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(numPrice);
  };

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    fetchProducts();
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

  return {
    products,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    lowStockProducts,
    isAdmin,
    createProduct,
    updateProduct,
    handleEditProduct,
    handleAdjustStock,
    handlePageChange,
    formatPrice,
    getCurrentPrices,
    getStockStatus,
  };
};
