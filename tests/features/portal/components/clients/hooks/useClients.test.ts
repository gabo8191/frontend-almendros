/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClients } from '../../../../../../src/features/portal/components/clients/hooks/useClients';
import { clientService, Client } from '../../../../../../src/features/portal/api/client/clientService';
import { useToast } from '../../../../../../src/shared/context/ToastContext';
import { useAuth } from '../../../../../../src/features/auth/context/AuthContext';
import { Role, User } from '../../../../../../src/features/auth/types';
import { AuthContextProps } from '../../../../../../src/features/auth/context/AuthContext';

// Mock dependencies
// Note: The paths for vi.mock need to be relative to *this test file's location* OR absolute from root/module alias.
// To keep it simple and robust against further moves, let's use paths relative from project root assuming Vitest runs from there.
// Or, even better, use Vitest's aliasing if configured, but for now, we'll try relative from the mocked file's actual location.
vi.mock('../../../../../../src/features/portal/api/client/clientService');
vi.mock('../../../../../../src/shared/context/ToastContext');
vi.mock('../../../../../../src/features/auth/context/AuthContext');

const mockShowToast = vi.fn();

// Define a sample client that matches the Client interface
const sampleClient: Client = { 
  id: 1, 
  name: 'Client 1', 
  isActive: true, 
  email: 'c1@test.com', 
  documentNumber: '123', 
  documentType: 'ID', 
  address: '-', 
  phoneNumber: '-', 
  createdAt: '2023-01-01T00:00:00.000Z', 
  updatedAt: '2023-01-01T00:00:00.000Z' 
};

const sampleClientPage2: Client = {
  id: 2, name: 'Client 2', isActive: true, email: 'c2@test.com', documentNumber: '456', documentType: 'ID', address: '-', phoneNumber: '-', createdAt: '2023-01-02T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z'
};


const mockUserAdmin: User = { id: '1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: Role.ADMINISTRATOR, isActive: true, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' };
const mockUserNonAdmin: User = { id: '2', email: 'user@example.com', firstName: 'Regular', lastName: 'User', role: Role.SALESPERSON, isActive: true, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' };


// Mock functions for AuthContext
const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn();


describe('useClients hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    
    // Default Auth mock to admin
    vi.mocked(useAuth).mockReturnValue({
      user: mockUserAdmin,
      isLoading: false,
      isAuthenticated: true,
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
    } as AuthContextProps); // Cast to AuthContextProps

    vi.mocked(clientService.getClients).mockResolvedValue({
      message: 'Successfully fetched clients',
      data: [sampleClient],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });
    vi.mocked(clientService.toggleClientStatus).mockResolvedValue(sampleClient); // Should return a Client
    vi.mocked(clientService.updateClient).mockResolvedValue(sampleClient); // Should return a Client
    vi.mocked(clientService.createClient).mockResolvedValue(sampleClient); // Should return a Client
  });

  it('should initialize with default values and fetch clients on mount', async () => {
    const { result } = renderHook(() => useClients());
    await act(async () => {}); 

    expect(result.current.isLoading).toBe(false);
    expect(result.current.clients).toEqual([sampleClient]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalClients).toBe(1);
    expect(clientService.getClients).toHaveBeenCalledTimes(1);
    expect(clientService.getClients).toHaveBeenCalledWith(1, 10, {});
  });

  it('should fetch clients when searchTerm changes', async () => {
    const { result } = renderHook(() => useClients());
    await act(async () => {}); // Initial fetch
    vi.mocked(clientService.getClients).mockClear(); // Clear after initial fetch

    act(() => {
      result.current.setSearchTerm('Test Search');
    });
    await act(async () => {}); // Wait for effects from searchTerm change

    expect(result.current.currentPage).toBe(1);
    expect(clientService.getClients).toHaveBeenCalledTimes(1); // Search term causes page set to 1, triggering 1 fetch via useEffect
    expect(clientService.getClients).toHaveBeenCalledWith(1, 10, { search: 'Test Search' });
  });

  it('should fetch clients when handlePageChange is called with a valid new page', async () => {
    vi.mocked(clientService.getClients).mockResolvedValue({
      message: 'Page 2 data',
      data: [sampleClientPage2],
      meta: { total: 2, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPreviousPage: true },
    });
    const { result } = renderHook(() => useClients());
    // Initial fetch for page 1 happens here due to mock setup in beforeEach
    await act(async () => {}); 
    vi.mocked(clientService.getClients).mockClear(); // Clear calls from initial fetch

    // Now, set up the mock for page 2 again specifically for this test's action
    vi.mocked(clientService.getClients).mockResolvedValue({
        message: 'Page 2 data',
        data: [sampleClientPage2],
        meta: { total: 2, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPreviousPage: true },
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    await act(async () => {});

    expect(result.current.currentPage).toBe(2);
    expect(result.current.clients).toEqual([sampleClientPage2]);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.totalClients).toBe(2);
    expect(clientService.getClients).toHaveBeenCalledTimes(1); // Only one call for page 2
    expect(clientService.getClients).toHaveBeenCalledWith(2, 10, {});
  });

  describe('toggleClientStatus', () => {
    const clientToToggleActive: Client = { ...sampleClient, id: 1, isActive: true };
    const clientToggledToInactive: Client = { ...sampleClient, id: 1, isActive: false };

    it('should call clientService.toggleClientStatus and refresh clients if user is admin', async () => {
      const { result } = renderHook(() => useClients());
      // Initial fetch occurs here, consuming the beforeEach mock for getClients
      await act(async () => {}); 
      
      // ASSERT initial state to be sure
      expect(result.current.clients).toEqual([sampleClient]); // sampleClient is active

      // Now, specifically mock the getClients call that will happen due to the refresh
      // inside toggleClientStatus. This OVERWRITES any previous mock for this specific call.
      vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
        message: 'Refreshed after toggle', 
        data: [clientToggledToInactive], // This is the data we expect after refresh
        meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      });

      await act(async () => {
        // This action will call toggleClientStatus, which internally calls clientService.toggleClientStatus
        // and then fetchClientsInternal (which calls clientService.getClients)
        await result.current.toggleClientStatus(clientToToggleActive); 
      });

      expect(clientService.toggleClientStatus).toHaveBeenCalledWith(1, false);
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Cliente desactivado exitosamente');
      
      expect(vi.mocked(clientService.getClients).mock.calls.length).toBe(2); 
      
      // Verify the LATEST call to getClients (the second call, at index 1)
      expect(vi.mocked(clientService.getClients).mock.calls[1][0]).toBe(1);    // page argument
      expect(vi.mocked(clientService.getClients).mock.calls[1][1]).toBe(10);   // limit argument
      expect(vi.mocked(clientService.getClients).mock.calls[1][2]).toEqual({}); // filters argument (assuming searchTerm was empty for this refresh)

      expect(result.current.clients).toEqual([clientToggledToInactive]);
    });

    it('should show error toast and not call service if user is not admin', async () => {
      vi.mocked(useAuth).mockReturnValue({ // Set user to non-admin for this test
        user: mockUserNonAdmin, isLoading: false, isAuthenticated: true, login: mockLogin, register: mockRegister, logout: mockLogout,
      } as AuthContextProps);
      const { result } = renderHook(() => useClients());
      await act(async () => {});

      await act(async () => {
        await result.current.toggleClientStatus(clientToToggleActive);
      });

      expect(clientService.toggleClientStatus).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('error', 'No tienes permisos para cambiar el estado de los clientes');
    });

    it('should handle API error during toggleClientStatus', async () => {
        const apiError = { response: { status: 500, data: { message: 'Server Error Toggle' } } };
        vi.mocked(clientService.toggleClientStatus).mockRejectedValue(apiError);
        const { result } = renderHook(() => useClients());
        await act(async () => {});

        await act(async () => {
            await result.current.toggleClientStatus(clientToToggleActive);
        });
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Server Error Toggle');
    });
  });

  describe('updateClient', () => {
    const updatedData = { name: 'Updated Client Name' };
    const clientAfterUpdate: Client = { ...sampleClient, id: 1, name: 'Updated Client Name' };

    it('should call clientService.updateClient and refresh clients on success', async () => {
      const { result } = renderHook(() => useClients());
      // Initial fetch occurs here
      await act(async () => {});
      expect(result.current.clients).toEqual([sampleClient]); // Initial state

      // Mock for the getClients call that will happen due to the refresh in updateClient
      vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
          message: 'Refreshed after update', 
          data: [clientAfterUpdate], // This is the data we expect after refresh
          meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      });

      let successResult;
      await act(async () => {
        successResult = await result.current.updateClient(1, updatedData);
      });

      expect(successResult).toBe(true);
      expect(clientService.updateClient).toHaveBeenCalledWith(1, updatedData);
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Cliente actualizado exitosamente');
      
      expect(vi.mocked(clientService.getClients).mock.calls.length).toBe(2); // 1 initial, 1 for refresh
      // Verify the LATEST call to getClients (the second call, at index 1)
      expect(vi.mocked(clientService.getClients).mock.calls[1][0]).toBe(1);    // page argument (assuming update keeps current page)
      expect(vi.mocked(clientService.getClients).mock.calls[1][1]).toBe(10);   // limit argument
      expect(vi.mocked(clientService.getClients).mock.calls[1][2]).toEqual({}); // filters argument (assuming searchTerm was empty)
      
      expect(result.current.clients).toEqual([clientAfterUpdate]);
    });

     it('should return false and show error toast on API error during updateClient', async () => {
        const apiError = { response: { data: { message: 'Update Failed Badly' } } };
        vi.mocked(clientService.updateClient).mockRejectedValue(apiError);
        const { result } = renderHook(() => useClients());
        await act(async () => {});

        let successResult;
        await act(async () => {
            successResult = await result.current.updateClient(1, { name: 'test update fail' });
        });

        expect(successResult).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al actualizar el cliente: Update Failed Badly');
    });
  });

  describe('createClient', () => {
    const newClientData = { name: 'Brand New Client', email: 'new@test.com', phoneNumber: '12345', address: 'New Address', documentType: 'NIF', documentNumber: 'Y123' };
    const clientAfterCreation: Client = { ...sampleClient, id: 99, ...newClientData };

    it('should call clientService.createClient, reset to page 1, and refresh clients on success', async () => {
      // This test simulates starting on page 2, then creating, which goes to page 1.
      // 1. Mock for initial fetch (when hook mounts, defaults to page 1 from state)
      vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
            message: 'Initial mount on page 1', data: [sampleClient], meta: { total: 1, page: 1, limit: 10, totalPages: 2, hasNextPage: true, hasPreviousPage: false }
      });
      // 2. Mock for fetch when handlePageChange(2) is called
      vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
            message: 'Data for page 2', data: [sampleClientPage2], meta: { total: 2, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPreviousPage: true }
      });
      // 3. Mock for fetch when createClient sets page to 1
      vi.mocked(clientService.getClients).mockResolvedValueOnce({
        message: 'Refreshed after create on page 1', data: [clientAfterCreation], meta: { total: 3, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false } 
      });

      const { result } = renderHook(() => useClients());
      await act(async () => {}); // Initial mount fetch (consumes mock 1)
      
      act(() => { result.current.handlePageChange(2); });
      await act(async () => {}); // Fetch for page 2 (consumes mock 2)
      
      vi.mocked(clientService.getClients).mockClear(); // Clear call count before create action, but mocks remain queued.

      let successResult;
      await act(async () => {
        successResult = await result.current.createClient(newClientData);
      });

      expect(successResult).toBe(true);
      expect(clientService.createClient).toHaveBeenCalledWith(newClientData);
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Cliente creado exitosamente');
      expect(result.current.currentPage).toBe(1);
      // This fetch is due to createClient setting currentPage to 1, which triggers the useEffect.
      expect(vi.mocked(clientService.getClients).mock.calls.length).toBe(1); // Consumes mock 3
      expect(clientService.getClients).toHaveBeenCalledWith(1, 10, {});
      expect(result.current.clients).toEqual([clientAfterCreation]);
    });

    it('should return false and show error toast on API error during createClient', async () => {
        const apiError = { response: { data: { message: 'Creation Failed Terribly' } } };
        vi.mocked(clientService.createClient).mockRejectedValue(apiError);
        const { result } = renderHook(() => useClients());
        await act(async () => {});

        let successResult;
        await act(async () => {
            successResult = await result.current.createClient(newClientData);
        });

        expect(successResult).toBe(false);
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al crear el cliente: Creation Failed Terribly');
    });
  });

  it('refreshClients should call fetchClients with current page', async () => {
    // Mock for the first call (initial mount on page 1)
    vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
      message: 'Initial Mount for refresh test', 
      data: [sampleClient], 
      meta: { total: 2, page: 1, limit: 10, totalPages: 2, hasNextPage: true, hasPreviousPage: false }
    });

    const { result } = renderHook(() => useClients());
    await act(async () => {}); // Initial fetch to page 1 (consumes the first mock)
    expect(result.current.currentPage).toBe(1);

    // Mock for the second call (handlePageChange to page 2)
    vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
      message: 'Page 2 data for refresh test', 
      data: [sampleClientPage2], 
      meta: { total: 2, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPreviousPage: true }
    });

    act(() => { result.current.handlePageChange(2); });
    await act(async () => {}); // Fetch for page 2 (consumes the second mock)
    expect(result.current.currentPage).toBe(2);
    expect(result.current.clients).toEqual([sampleClientPage2]);
    
    // Mock for the third call (the refresh action itself, still on page 2)
    vi.mocked(clientService.getClients).mockResolvedValueOnce({ 
        message: 'Refreshed page 2 data', 
        data: [sampleClientPage2], // Or different data if refresh implies fetching new stuff
        meta: { total: 2, page: 2, limit: 10, totalPages: 2, hasNextPage: false, hasPreviousPage: true }
    });

    act(() => {
      result.current.refreshClients();
    });
    await act(async () => {}); // Wait for refresh fetch (consumes the third mock)

    // Check that getClients was called 3 times in total for this test execution
    expect(vi.mocked(clientService.getClients).mock.calls.length).toBe(3);
    // Check the arguments of the LATEST (third) call
    const thirdCallArgs = vi.mocked(clientService.getClients).mock.calls[2];
    expect(thirdCallArgs[0]).toBe(2); // page
    expect(thirdCallArgs[1]).toBe(10); // limit
    expect(thirdCallArgs[2]).toEqual({}); // filters (assuming searchTerm is empty)
    
    expect(result.current.clients).toEqual([sampleClientPage2]);
  });
}); 