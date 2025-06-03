/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProducts } from '../../../../../../src/features/portal/components/products/Hooks/useProducts';
import { productService } from '../../../../../../src/features/portal/api/product';
import { Product } from '../../../../../../src/features/portal/api/product/types';
import { useToast } from '../../../../../../src/shared/context/ToastContext';
import { useAuth } from '../../../../../../src/features/auth/context/AuthContext';
import { Role, User } from '../../../../../../src/features/auth/types';
import { useNavigate } from 'react-router-dom';

// Mock services and hooks
vi.mock('../../../../../../src/features/portal/api/product');
vi.mock('../../../../../../src/shared/context/ToastContext');
vi.mock('../../../../../../src/features/auth/context/AuthContext');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Adjusted mockProductPrice to match inline type in Product.prices
const mockInlineProductPrice = {
  id: 1,
  purchasePrice: 80,
  sellingPrice: 120,
  isCurrentPrice: true,
  // createdAt is not part of the inline definition in Product.prices
};

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  // sku, barcode, categoryId, category, supplier removed
  currentStock: 10,
  minQuantity: 5,
  maxQuantity: 20,
  supplierId: 1, // Already has supplierId
  prices: [mockInlineProductPrice],
  purchasePrice: 80, 
  sellingPrice: 120,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProductsResponse = {
  data: [mockProduct, { ...mockProduct, id: 2, name: 'Another Product' }],
  meta: { total: 2, page: 1, limit: 12, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  message: 'Success',
};

const mockLowStockProducts: Product[] = [{ ...mockProduct, id: 3, name: 'Low Stock Product', currentStock: 3 }];

const mockShowToast = vi.fn();
const mockNavigate = vi.fn();
const mockAdminUser: User = { id: 'adminUser', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: Role.ADMINISTRATOR, isActive: true, createdAt: '', updatedAt: '' };

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(useAuth).mockReturnValue({ user: mockAdminUser } as any);
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(productService.getProducts).mockResolvedValue(mockProductsResponse);
    vi.mocked(productService.getLowStockProducts).mockResolvedValue(mockLowStockProducts);
    vi.mocked(productService.createProduct).mockResolvedValue({ ...mockProduct, id: 100 });
    vi.mocked(productService.updateProduct).mockResolvedValue({ ...mockProduct, id: mockProduct.id, name: 'Updated Name' });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize, fetch products, and low stock products', async () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.isLoading).toBe(true);
    await act(async () => { vi.runAllTimers(); });

    // Expect 2 calls due to useEffect [currentPage] and useEffect [searchTerm] both running initially
    expect(productService.getProducts).toHaveBeenCalledTimes(2); 
    expect(productService.getLowStockProducts).toHaveBeenCalledTimes(1);
    expect(result.current.products.length).toBe(2);
    expect(result.current.lowStockProducts.length).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('createProduct should call service, show toast, refresh data, and return true', async () => {
    const { result } = renderHook(() => useProducts());
    await act(async () => { vi.runAllTimers(); }); // Initial fetches
    
    vi.mocked(productService.getProducts).mockClear();
    vi.mocked(productService.getLowStockProducts).mockClear();

    const newProductData = { name: 'New Prod', purchasePrice: 150, sellingPrice: 200, supplierId: 1, minQuantity:1, maxQuantity:10, description: 'new' }; // ensure all required fields for CreateProductData are present
    let createResult: boolean | undefined;
    await act(async () => {
      createResult = await result.current.createProduct(newProductData);
      vi.runAllTimers(); // For timeouts in createProduct
    });

    expect(productService.createProduct).toHaveBeenCalledWith(newProductData);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Producto creado exitosamente');
    expect(productService.getProducts).toHaveBeenCalledTimes(1); // Refreshed
    expect(productService.getLowStockProducts).toHaveBeenCalledTimes(1); // Refreshed
    expect(createResult).toBe(true);
  });

  it('handlePageChange should update currentPage and refetch', async () => {
    // Ensure initial fetch sets totalPages appropriately for the test
    vi.mocked(productService.getProducts).mockResolvedValue({ 
      ...mockProductsResponse, 
      meta: { ...mockProductsResponse.meta, totalPages: 3 } // Set totalPages > 1
    });

    const { result } = renderHook(() => useProducts());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch, totalPages will be 3

    // Clear mocks for the call triggered by handlePageChange
    vi.mocked(productService.getProducts).mockClear();
    vi.mocked(productService.getLowStockProducts).mockClear();

    // Mock for the fetch on page 2
    vi.mocked(productService.getProducts).mockResolvedValue({ 
      ...mockProductsResponse, 
      data: [{ ...mockProduct, id: 10, name: 'Page 2 Product'}], // Different data for page 2
      meta: { ...mockProductsResponse.meta, page: 2, totalPages: 3 }
    });

    act(() => { result.current.handlePageChange(2); });
    await act(async () => { vi.runAllTimers(); }); // useEffect for currentPage runs

    expect(result.current.currentPage).toBe(2);
    expect(productService.getProducts).toHaveBeenCalledTimes(1); // Called for page 2
    expect(productService.getProducts).toHaveBeenLastCalledWith(2, 12, { name: undefined, isActive: true });
    expect(productService.getLowStockProducts).toHaveBeenCalledTimes(1); // Also called due to currentPage change
  });

  it('setSearchTerm should update searchTerm and refetch after debounce (or reset page)', async () => {
    const { result } = renderHook(() => useProducts());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch

    vi.mocked(productService.getProducts).mockClear();

    act(() => { result.current.setSearchTerm('TestSearch'); });
    await act(async () => { vi.runAllTimers(); }); 

    expect(result.current.searchTerm).toBe('TestSearch');
    expect(productService.getProducts).toHaveBeenCalledTimes(1);
    expect(productService.getProducts).toHaveBeenLastCalledWith(1, 12, { name: 'TestSearch', isActive: true });
    expect(result.current.currentPage).toBe(1); 
  });

  it('handleAdjustStock should navigate to inventory', async () => {
    const { result } = renderHook(() => useProducts());
    await act(async () => { vi.runAllTimers(); });

    act(() => { result.current.handleAdjustStock(mockProduct); });
    expect(mockNavigate).toHaveBeenCalledWith('/portal/inventory', { 
      state: { productId: mockProduct.id, productName: mockProduct.name }
    });
  });
}); 