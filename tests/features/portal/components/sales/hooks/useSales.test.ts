/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSales } from '../../../../../../src/features/portal/components/sales/hooks/useSales';
import { saleService, Sale, SaleDetail } from '../../../../../../src/features/portal/api/sale/saleService';
import { useToast } from '../../../../../../src/shared/context/ToastContext';

// Mock services and hooks
vi.mock('../../../../../../src/features/portal/api/sale/saleService');
vi.mock('../../../../../../src/shared/context/ToastContext');

const mockSaleDetail: SaleDetail = {
  id: 1,
  quantity: 2,
  unitPrice: 50,
  discountAmount: 0,
  productId: 101,
  product: { name: 'Mock Product', description: 'Mock Desc' },
};

const mockSale1: Sale = {
  id: 1,
  saleDate: '2023-10-26T10:00:00Z',
  clientId: 1,
  client: { name: 'Client Alpha', email: 'alpha@example.com', documentNumber: '123' },
  details: [mockSaleDetail],
  totalAmount: 100,
  createdAt: '2023-10-26T10:00:00Z',
  updatedAt: '2023-10-26T10:00:00Z',
};

const mockSale2: Sale = {
  id: 2,
  saleDate: '2023-10-25T12:00:00Z',
  clientId: 2,
  client: { name: 'Client Beta', email: 'beta@example.com', documentNumber: '456' },
  details: [{ 
    ...mockSaleDetail, 
    id: 2, 
    quantity: 1, 
    productId: 102 
  }],
  totalAmount: 75,
  createdAt: '2023-10-25T12:00:00Z',
  updatedAt: '2023-10-25T12:00:00Z',
};

const mockSalesResponse = {
  data: [mockSale1, mockSale2],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  message: 'Success', // Assuming PaginatedResponse might have a message
};

const mockShowToast = vi.fn();

describe('useSales Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(saleService.getSales).mockResolvedValue(mockSalesResponse);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with default values and fetch sales', async () => {
    const { result } = renderHook(() => useSales());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.sales).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.dateFilter).toEqual({ startDate: '', endDate: '' });

    await act(async () => { vi.runAllTimers(); });

    expect(saleService.getSales).toHaveBeenCalledTimes(1);
    expect(saleService.getSales).toHaveBeenCalledWith(1, 10, { startDate: '', endDate: '' });
    expect(result.current.isLoading).toBe(false);
    // Note: sales are filtered by searchTerm ('') and sorted by saleDate desc by default
    // So mockSale1 (Oct 26) should come before mockSale2 (Oct 25)
    expect(result.current.sales.map(s => s.id)).toEqual([mockSale1.id, mockSale2.id]);
    expect(result.current.totalPages).toBe(mockSalesResponse.meta.totalPages);
    expect(result.current.totalSales).toBe(mockSalesResponse.meta.total);
  });

  it('should fetch sales with date filters', async () => {
    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch

    vi.mocked(saleService.getSales).mockClear();
    const newStartDate = '2023-10-01';
    const newEndDate = '2023-10-31';

    act(() => {
      result.current.handleDateFilterChange('startDate', newStartDate);
      result.current.handleDateFilterChange('endDate', newEndDate);
    });

    await act(async () => { vi.runAllTimers(); });

    expect(saleService.getSales).toHaveBeenCalledTimes(1); // Only one fetch because date changes trigger a single useEffect
    expect(saleService.getSales).toHaveBeenCalledWith(1, 10, { startDate: newStartDate, endDate: newEndDate });
    expect(result.current.currentPage).toBe(1); // Resets to page 1 on filter change
  });

  it('should handle page changes', async () => {
    const mockPage2Response = {
      ...mockSalesResponse,
      data: [{ ...mockSale1, id: 3 }],
      meta: { ...mockSalesResponse.meta, page: 2, totalPages: 2 },
    };
    vi.mocked(saleService.getSales).mockResolvedValueOnce(mockSalesResponse) // Initial
                                   .mockResolvedValueOnce(mockPage2Response); // For page 2

    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch for page 1
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1); // From initial mock

    // To correctly test pagination, ensure the first call sets totalPages > 1
    vi.mocked(saleService.getSales).mockClear().mockResolvedValueOnce({
        ...mockSalesResponse, meta: { ...mockSalesResponse.meta, totalPages: 3 }
    });
    const { result: resultForPageChange, rerender } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch, totalPages will be 3

    vi.mocked(saleService.getSales).mockClear().mockResolvedValueOnce({
        ...mockSalesResponse, data: [{...mockSale1, id: 10}], meta: { ...mockSalesResponse.meta, page: 2, totalPages: 3 }
    });

    act(() => { resultForPageChange.current.handlePageChange(2); });
    // The useEffect [currentPage] will trigger the fetch.
    await act(async () => { vi.runAllTimers(); });

    expect(resultForPageChange.current.currentPage).toBe(2);
    expect(saleService.getSales).toHaveBeenCalledTimes(1);
    expect(saleService.getSales).toHaveBeenCalledWith(2, 10, { startDate: '', endDate: '' });
    expect(resultForPageChange.current.sales[0].id).toBe(10);
  });

  it('should filter sales by searchTerm (client-side)', async () => {
    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); });

    expect(result.current.sales.length).toBe(2); // mockSale1 and mockSale2

    act(() => { result.current.setSearchTerm('Alpha'); });
    expect(result.current.sales.length).toBe(1);
    expect(result.current.sales[0].client?.name).toBe('Client Alpha');

    act(() => { result.current.setSearchTerm('NonExistent'); });
    expect(result.current.sales.length).toBe(0);

    act(() => { result.current.setSearchTerm(''); }); // Clear search
    expect(result.current.sales.length).toBe(2);
  });

  it('should sort sales by saleDate and id', async () => {
    // mockSale1: 2023-10-26, id: 1
    // mockSale2: 2023-10-25, id: 2
    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); });

    // Default sort: saleDate desc
    expect(result.current.sales.map(s => s.id)).toEqual([1, 2]);

    act(() => { result.current.handleSort('saleDate'); }); // Toggle to asc
    expect(result.current.sales.map(s => s.id)).toEqual([2, 1]);

    act(() => { result.current.handleSort('id'); }); // Sort by id desc
    expect(result.current.sales.map(s => s.id)).toEqual([2, 1]);

    act(() => { result.current.handleSort('id'); }); // Toggle id to asc
    expect(result.current.sales.map(s => s.id)).toEqual([1, 2]);
  });

  it('clearFilters should reset dateFilter, searchTerm and fetch page 1', async () => {
    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch

    act(() => {
      result.current.handleDateFilterChange('startDate', '2023-01-01');
      result.current.setSearchTerm('Something');
    });
    await act(async () => { vi.runAllTimers(); }); // Fetch due to date change
    vi.mocked(saleService.getSales).mockClear();

    act(() => { result.current.clearFilters(); });
    await act(async () => { vi.runAllTimers(); });

    expect(result.current.dateFilter).toEqual({ startDate: '', endDate: '' });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.currentPage).toBe(1);
    expect(saleService.getSales).toHaveBeenCalledTimes(1);
    expect(saleService.getSales).toHaveBeenCalledWith(1, 10, { startDate: '', endDate: '' });
  });

   it('formatDate should format date string correctly', () => {
    const { result } = renderHook(() => useSales());
    const dateStr = '2023-10-26T10:30:00Z';
    // Note: toLocaleDateString output can be sensitive to the test runner's locale.
    // For consistency, we might need to mock the locale or use a more robust date formatting assertion.
    // For this example, we assume 'es-CO' produces a predictable format part.
    expect(result.current.formatDate(dateStr)).toMatch(/octubre 26 de 2023/i);
    expect(result.current.formatDate(dateStr)).toMatch(/10:30/);
  });

  it('formatCurrency should format number to COP currency', () => {
    const { result } = renderHook(() => useSales());
    const amount = 123456.78;
    // Expected: $123,457 (COP rounds to nearest integer for display typically)
    // Or $123.456,78 if decimals are kept. Let's check typical COP formatting.
    // Intl.NumberFormat for COP often omits decimals by default or uses ',' as decimal sep if forced.
    // The hook implementation uses default options which should be fine.
    // We'll check for the currency symbol and the presence of the number parts.
    const formatted = result.current.formatCurrency(amount);
    expect(formatted).toContain('$');
    expect(formatted).toContain('123'); 
    expect(formatted).toContain('457'); // Test based on rounding
  });

  it('handleRefresh should fetch current page', async () => {
    const { result } = renderHook(() => useSales());
    await act(async () => { vi.runAllTimers(); }); // Initial fetch
    
    act(() => { result.current.handlePageChange(2); });
    await act(async () => { vi.runAllTimers(); }); // Fetch for page 2
    vi.mocked(saleService.getSales).mockClear();

    act(() => { result.current.handleRefresh(); });
    await act(async () => { vi.runAllTimers(); });

    expect(saleService.getSales).toHaveBeenCalledTimes(1);
    expect(saleService.getSales).toHaveBeenCalledWith(2, 10, { startDate: '', endDate: '' });
  });

  it('should handle API error when fetching sales', async () => {
    vi.mocked(saleService.getSales).mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useSales());

    await act(async () => { vi.runAllTimers(); });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sales).toEqual([]);
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al cargar las ventas');
  });

}); 