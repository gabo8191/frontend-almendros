/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDashboard, RecentSale } from '../../../../../../src/features/portal/components/dashboard/hooks/useDashboard';
import { saleService, SaleDetail } from '../../../../../../src/features/portal/api/sale/saleService';
import { productService } from '../../../../../../src/features/portal/api/product';
import { Product } from '../../../../../../src/features/portal/api/product/types';
import { clientService } from '../../../../../../src/features/portal/api/client/clientService';
import { useToast } from '../../../../../../src/shared/context/ToastContext';

// Mock services
vi.mock('../../../../../../src/features/portal/api/sale/saleService');
vi.mock('../../../../../../src/features/portal/api/product');
vi.mock('../../../../../../src/features/portal/api/client/clientService');
vi.mock('../../../../../../src/shared/context/ToastContext');

const mockSaleDetail: SaleDetail = {
  id: 1,
  quantity: 1,
  unitPrice: 100,
  discountAmount: 0,
  productId: 1,
  product: { name: 'Detail Product', description: 'Detail Desc' },
};

const mockSale = {
  id: 1,
  clientId: 1,
  client: { id: 1, name: 'Test Client', email: 'test@client.com', documentNumber: '123' },
  saleDate: new Date().toISOString(),
  totalAmount: 100,
  details: [mockSaleDetail],
  paymentMethod: 'cash',
  status: 'completed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Test sale',
};

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  minQuantity: 1,
  maxQuantity: 100,
  supplierId: 1,
  purchasePrice: 5,
  sellingPrice: 10,
  currentStock: 5,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  prices: [{id: 1, purchasePrice: 5, sellingPrice: 10, isCurrentPrice: true}]
};


describe('useDashboard Hook', () => {
  const mockShowToast = vi.fn();
  const defaultMeta = { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false };

  // To store original timer functions
  let originalSetInterval: typeof setInterval;
  let originalClearInterval: typeof clearInterval;

  beforeEach(() => {
    vi.useFakeTimers(); // Enable fake timers

    // Store original timers and mock them
    // This provides more control and helps avoid ReferenceError for clearInterval
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;
    global.setInterval = vi.fn().mockReturnValue(12345 as any); // Return a dummy ID, do not actually schedule
    global.clearInterval = vi.fn();
    
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });

    vi.mocked(saleService.getSales).mockImplementation(async (_page, limit, _filters) => {
      if (limit === 5) { 
        return {
          data: Array(2).fill(null).map((_, i) => ({
            ...mockSale,
            id: i + 10, 
            client: { name: `Recent Client ${i + 1}`, email: 'email@test.com', documentNumber: '123' },
            totalAmount: (i + 1) * 75,
            saleDate: new Date().toISOString(),
            clientId: i + 10,
            details: [mockSaleDetail]
          })),
          meta: { ...defaultMeta, total: 2, limit: 5, totalPages: 1 },
        };
      }
      return { data: [], meta: { ...defaultMeta, total: 0, limit: limit || 100 } }; 
    });

    vi.mocked(productService.getProducts).mockResolvedValue({
      data: [mockProduct],
      meta: { ...defaultMeta, total: 25, limit: 1 },
    });
    vi.mocked(productService.getLowStockProducts).mockResolvedValue([
      { ...mockProduct, currentStock: 2, id: 10 },
      { ...mockProduct, currentStock: 1, id: 11 },
    ]);
    vi.mocked(clientService.getClients).mockResolvedValue({
      message: 'Clients fetched successfully',
      data: [{ id: 1, name: 'Client 1', email: '', documentNumber: '', documentType: 'ID', address: '-', phoneNumber: '-', isActive: true, createdAt: '', updatedAt: '' }],
      meta: { ...defaultMeta, total: 50, limit: 1 },
    });
  });

  afterEach(() => {
    // Restore original timers
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    
    vi.useRealTimers(); // Switch back to real timers
    vi.restoreAllMocks(); // Restore all other vi.fn, vi.spyOn, etc.
  });

  it('should initialize with loading state true and default values, then load data', async () => {
    const { result } = renderHook(() => useDashboard());
    expect(result.current.stats.isLoading).toBe(true); // Initial state from useState

    await act(async () => {
      await vi.runAllTimersAsync(); // Allow useEffect and fetchDashboardData to run
    });

    expect(result.current.stats.isLoading).toBe(false); // After fetch
    // Add more assertions here if needed about the *default* loaded state from beforeEach mocks
    expect(result.current.stats.totalProducts).toBe(25); // Example from mock
  });
  
  it('should fetch and set dashboard data successfully', async () => {
    // Restore real setInterval for this specific test if its logic is important, or provide a test-specific mock
    // For this test, the default mock (vi.fn()) for setInterval is fine as we are not testing interval execution here.

    const todaySale = { ...mockSale, id: 100, totalAmount: 100, clientId: 100, details: [{...mockSaleDetail, id:100}] };
    const weekSale1 = { ...mockSale, id: 200, totalAmount: 200, clientId: 200, details: [{...mockSaleDetail, id:200}] };
    const weekSale2 = { ...mockSale, id: 201, totalAmount: 250, clientId: 201, details: [{...mockSaleDetail, id:201}] };
    const expectedRecentSale1: RecentSale = { id: 300, clientName: 'Hook Recent Client 1', total: 50, date: '2023-01-01T10:00:00Z' };
    const expectedRecentSale2: RecentSale = { id: 301, clientName: 'Hook Recent Client 2', total: 75, date: '2023-01-02T11:00:00Z' };

    let saleServiceCallCount = 0;
    vi.mocked(saleService.getSales).mockImplementation(async (_page, limit, _filters) => {
      saleServiceCallCount++;
      if (saleServiceCallCount === 1) return { data: [todaySale], meta: { ...defaultMeta, total: 1, limit: 100 } };
      if (saleServiceCallCount === 2) return { data: [weekSale1, weekSale2], meta: { ...defaultMeta, total: 2, limit: 100 } };
      if (saleServiceCallCount === 3) return { 
            data: [ 
                { ...mockSale, id: expectedRecentSale1.id, client: {name: expectedRecentSale1.clientName, email: 'email', documentNumber: 'doc'}, totalAmount: expectedRecentSale1.total, saleDate: expectedRecentSale1.date, clientId: 300, details: [mockSaleDetail] },
                { ...mockSale, id: expectedRecentSale2.id, client: {name: expectedRecentSale2.clientName, email: 'email', documentNumber: 'doc'}, totalAmount: expectedRecentSale2.total, saleDate: expectedRecentSale2.date, clientId: 301, details: [mockSaleDetail] }
            ], 
            meta: { ...defaultMeta, total: 2, limit: 5 } 
        };
      return { data: [], meta: { ...defaultMeta, total: 0, limit: limit || 10 } }; 
    });

    vi.mocked(productService.getProducts).mockResolvedValueOnce({ 
      data: [mockProduct],
      meta: { ...defaultMeta, total: 25, limit: 1 },
    });
    vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
      message: 'Clients fetched successfully for test',
      data: [{ id:1, name: 'Client 1', email: '', documentNumber: '', documentType: 'ID', address: '-', phoneNumber: '-', isActive: true, createdAt: '', updatedAt: '' }],
      meta: { ...defaultMeta, total: 50, limit: 1 },
    });
    vi.mocked(productService.getLowStockProducts).mockResolvedValueOnce([
      { ...mockProduct, currentStock: 1, id: 10 }, { ...mockProduct, currentStock: 2, id: 11 }
    ]);

    const { result } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); });

    expect(result.current.stats.isLoading).toBe(false);
    expect(result.current.stats.todaySales).toEqual({ total: 100, count: 1 });
    expect(result.current.stats.thisWeekSales).toEqual({ total: 450, count: 2 });
    expect(result.current.stats.lowStockProducts).toBe(2);
    expect(result.current.stats.totalProducts).toBe(25);
    expect(result.current.stats.totalClients).toBe(50);
    expect(result.current.stats.recentSales).toEqual([expectedRecentSale1, expectedRecentSale2]);
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(saleServiceCallCount).toBe(3); 
  });

  it('should handle errors during data fetching and show toast', async () => {
    vi.mocked(saleService.getSales).mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); });

    expect(result.current.stats.isLoading).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al cargar las estadísticas del dashboard');
    expect(result.current.stats.recentSales).toEqual([]);
  });

  it('refreshData should refetch data', async () => {
    const { result } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); }); // Initial fetch

    vi.clearAllMocks(); // Clear mocks for services to track calls for refresh
    // Re-mock useToast as clearAllMocks would clear it
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast }); 
    // Ensure global.setInterval/clearInterval are still our test mocks for this phase if needed
    // (they are, due to beforeEach/afterEach structure for this edit)
    // Re-mock services for the refresh call
    const refreshedTodaySale = { ...mockSale, id: 101, totalAmount: 150, clientId: 101, details: [mockSaleDetail] };
    vi.mocked(saleService.getSales)
      .mockImplementationOnce(async () => ({ data: [refreshedTodaySale], meta: { ...defaultMeta, total: 1, limit: 100 } })) 
      .mockImplementationOnce(async () => ({ data: [], meta: { ...defaultMeta, total: 0, limit: 100 } }))       
      .mockImplementationOnce(async () => ({ data: [], meta: { ...defaultMeta, total: 0, limit: 5 } }));        
    vi.mocked(productService.getProducts).mockResolvedValueOnce({ data: [mockProduct], meta: { ...defaultMeta, total: 30, limit: 1 } });
    vi.mocked(clientService.getClients).mockResolvedValueOnce({ message: 'Refreshed', data: [], meta: { ...defaultMeta, total: 55, limit: 1 } });
    vi.mocked(productService.getLowStockProducts).mockResolvedValueOnce([]);

    await act(async () => { result.current.refreshData(); });
    await act(async () => { await vi.runAllTimersAsync(); });// Wait for refresh to complete

    expect(result.current.stats.isLoading).toBe(false);
    expect(result.current.stats.todaySales).toEqual({ total: 150, count: 1 });
    expect(result.current.stats.totalProducts).toBe(30);
    // ... other assertions for refreshed data
  });

  it('should format currency correctly', async () => {
    const { result } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); }); // Wait for initial load to prevent act warning
    const formatted = result.current.formatCurrency(12345.67);
    expect(formatted).toContain('$');
    expect(formatted).toMatch(/12.345[,.]67/);
    const formattedZero = result.current.formatCurrency(0);
    expect(formattedZero).toContain('$');
    expect(formattedZero).toMatch(/0[,.]00/);
  });

  it('should format date correctly', async () => {
    const { result } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); }); // Wait for initial load
    const testDate = '2023-10-26T14:30:00Z';
    const formattedDate = result.current.formatDate(testDate);
    expect(formattedDate).toMatch(/oct./i);
    expect(formattedDate).toContain('26');
    expect(formattedDate).toMatch(/\d{1,2}:\d{2}\s*(a.\s*m.|p.\s*m.|am|pm)/i);
  });
  
  it('should clear interval on unmount', async () => {
    // global.clearInterval is already vi.fn() from beforeEach
    // global.setInterval is also vi.fn() from beforeEach, which is fine for this test
    // as we just care that clearInterval is called with whatever setInterval returned.
    
    const { unmount } = renderHook(() => useDashboard());
    await act(async () => { await vi.runAllTimersAsync(); }); // Let useEffect run
    unmount();
    expect(global.clearInterval).toHaveBeenCalledTimes(1);
    // We can also check if it was called with the dummy ID if needed, e.g.:
    // expect(global.clearInterval).toHaveBeenCalledWith(12345);
  });
}); 