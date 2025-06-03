/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInventoryMovements } from '../../../../../../src/features/portal/components/inventory/hooks/useInventoryMovements';
import { inventoryService, InventoryMovement, MovementType } from '../../../../../../src/features/portal/api/inventory/inventoryService';
import { useToast } from '../../../../../../src/shared/context/ToastContext';

// Mock services and hooks
vi.mock('../../../../../../src/features/portal/api/inventory/inventoryService');
vi.mock('../../../../../../src/shared/context/ToastContext');

// Adjusted mockProduct based on InventoryMovement.product structure
const mockSimpleProduct = {
  id: 1, // Changed to number
  name: 'Test Product',
  description: 'A product for testing',
  currentStock: 10,
};

const mockMovement: InventoryMovement = {
  id: 101, // Changed to number
  type: 'ENTRY' as MovementType, // Corrected type and cast
  quantity: 10,
  reason: 'Initial stock',
  movementDate: new Date().toISOString(),
  // productId: 1, // productId is part of createMovement, not directly in InventoryMovement root
  product: mockSimpleProduct,
  user: { id: 'user1', firstName: 'Test', lastName: 'User', email: 'user@example.com' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMovementsResponse = {
  message: 'Success',
  data: [
    mockMovement, 
    { ...mockMovement, id: 102, type: 'EXIT' as MovementType, reason: 'Sale' } // Changed id to number, corrected type
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

const mockShowToast = vi.fn();

describe('useInventoryMovements Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(inventoryService.getMovements).mockResolvedValue(mockMovementsResponse);
    vi.mocked(inventoryService.createMovement).mockResolvedValue({ 
        ...mockMovement, 
        id: 103, 
        type: 'ENTRY' as MovementType, 
        reason: 'Correction' 
    });
  });

  it('should initialize, fetch movements, and set initial state', async () => {
    const { result } = renderHook(() => useInventoryMovements());
    expect(result.current.isLoading).toBe(true);
    await act(async () => {});

    expect(inventoryService.getMovements).toHaveBeenCalledTimes(1);
    expect(inventoryService.getMovements).toHaveBeenCalledWith(1, 10, { reason: undefined, type: undefined });
    expect(result.current.movements.length).toBe(2);
    expect(result.current.movements[0].reason).toBe('Initial stock');
    expect(result.current.totalPages).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error when fetching movements', async () => {
    vi.mocked(inventoryService.getMovements).mockRejectedValueOnce(new Error('Fetch error'));
    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.movements.length).toBe(0);
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al cargar los movimientos');
  });

  it('createMovement should call service, show toast, refresh, and return true on success', async () => {
    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {}); // Initial fetch
    const newMovementData = { productId: 1, type: 'ENTRY' as MovementType, quantity: 5, reason: 'Correction' };
    let createResult: boolean | undefined;

    await act(async () => {
      createResult = await result.current.createMovement(newMovementData);
    });

    expect(inventoryService.createMovement).toHaveBeenCalledWith(newMovementData);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Movimiento registrado exitosamente');
    expect(inventoryService.getMovements).toHaveBeenCalledTimes(2); 
    expect(createResult).toBe(true);
  });
  
  it('should refetch data when currentPage changes via handlePageChange', async () => {
    vi.mocked(inventoryService.getMovements).mockResolvedValue({ 
      ...mockMovementsResponse, 
      data: [{...mockMovement, id: 201, product: {...mockSimpleProduct}}],
      meta: { ...mockMovementsResponse.meta, page: 1, totalPages: 2 }
    });

    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {});
    
    vi.mocked(inventoryService.getMovements).mockClear();
    vi.mocked(inventoryService.getMovements).mockResolvedValue({
      ...mockMovementsResponse,
      data: [{...mockMovement, id: 202, product: {...mockSimpleProduct}}],
      meta: { ...mockMovementsResponse.meta, page: 2, totalPages: 2 }
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    await act(async () => {});

    expect(result.current.currentPage).toBe(2);
    expect(inventoryService.getMovements).toHaveBeenCalledTimes(1);
    expect(inventoryService.getMovements).toHaveBeenLastCalledWith(2, 10, { type: undefined, reason: undefined });
  });

  it('should refetch data when searchTerm changes', async () => {
    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {}); 
    vi.mocked(inventoryService.getMovements).mockClear();

    act(() => {
      result.current.setSearchTerm('Sale');
    });
    await act(async () => {});

    expect(inventoryService.getMovements).toHaveBeenCalledTimes(1);
    expect(inventoryService.getMovements).toHaveBeenLastCalledWith(1, 10, { type: undefined, reason: 'Sale' });
  });

  it('should refetch data when selectedMovementType changes', async () => {
    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {}); 
    vi.mocked(inventoryService.getMovements).mockClear();

    act(() => {
      result.current.setSelectedMovementType('EXIT');
    });
    await act(async () => {});

    expect(inventoryService.getMovements).toHaveBeenCalledTimes(1);
    expect(inventoryService.getMovements).toHaveBeenLastCalledWith(1, 10, { type: 'EXIT', reason: undefined });
  });

  it('refreshMovements should call fetchMovements with current page and filters', async () => {
    vi.mocked(inventoryService.getMovements).mockResolvedValueOnce({ 
      ...mockMovementsResponse, 
      meta: { ...mockMovementsResponse.meta, totalPages: 3 }
    });

    const { result } = renderHook(() => useInventoryMovements());
    await act(async () => {});

    act(() => { result.current.setSearchTerm('SearchTerm'); });
    act(() => { result.current.setSelectedMovementType('ENTRY'); });
    
    vi.mocked(inventoryService.getMovements).mockClear();
    vi.mocked(inventoryService.getMovements).mockResolvedValueOnce({ 
        ...mockMovementsResponse, 
        data: [{...mockMovement, id: 301, product: {...mockSimpleProduct}}],
        meta: { ...mockMovementsResponse.meta, page: 2, totalPages: 3 }
    });

    act(() => { result.current.handlePageChange(2); }); 
    await act(async () => {});
    
    expect(result.current.currentPage).toBe(2);

    vi.mocked(inventoryService.getMovements).mockClear();
    
    vi.mocked(inventoryService.getMovements).mockResolvedValueOnce({ 
        ...mockMovementsResponse, 
        data: [{...mockMovement, id: 302, product: {...mockSimpleProduct}}],
        meta: { ...mockMovementsResponse.meta, page: 2, totalPages: 3 } 
    });

    act(() => {
      result.current.refreshMovements();
    });
    await act(async () => {});

    expect(inventoryService.getMovements).toHaveBeenCalledTimes(1);
    expect(inventoryService.getMovements).toHaveBeenLastCalledWith(2, 10, { type: 'ENTRY', reason: 'SearchTerm' });
  });
}); 