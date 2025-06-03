/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmployees } from '../../../../../../src/features/portal/components/employees/hooks/useEmployees';
import { employeeService } from '../../../../../../src/features/portal/api/employee/employeeService';
import { useToast } from '../../../../../../src/shared/context/ToastContext';
import { User as UserType, Role } from '../../../../../../src/features/auth/types';

// Mock services and hooks
vi.mock('../../../../../../src/features/portal/api/employee/employeeService');
vi.mock('../../../../../../src/shared/context/ToastContext');

const mockUser: UserType = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: Role.SALESPERSON,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  phoneNumber: '1234567890',
  address: '123 Main St',
};

const mockEmployeesResponse = {
  message: 'Successfully fetched employees',
  data: [mockUser, { ...mockUser, id: '2', firstName: 'Jane', email: 'jane.doe@example.com' }],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

const mockShowToast = vi.fn();

describe('useEmployees Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(employeeService.getEmployees).mockResolvedValue(mockEmployeesResponse);
    vi.mocked(employeeService.toggleEmployeeStatus).mockResolvedValue({ ...mockUser, isActive: !mockUser.isActive });
    vi.mocked(employeeService.updateEmployee).mockImplementation(async (id, data) => ({ 
      ...mockUser, 
      id,
      ...data, 
    }));
    vi.mocked(employeeService.createEmployee).mockResolvedValue({ ...mockUser, id: 'newUser' });
  });

  it('should initialize, fetch employees, and set initial state', async () => {
    const { result } = renderHook(() => useEmployees());
    
    expect(result.current.isLoading).toBe(true);
    await act(async () => {}); // Allow promises to resolve

    expect(employeeService.getEmployees).toHaveBeenCalledTimes(1);
    expect(result.current.employees.length).toBe(2);
    expect(result.current.employees[0].firstName).toBe('John');
    expect(result.current.totalPages).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error when fetching employees', async () => {
    vi.mocked(employeeService.getEmployees).mockRejectedValueOnce(new Error('Fetch error'));
    const { result } = renderHook(() => useEmployees());
    await act(async () => {}); 

    expect(result.current.isLoading).toBe(false);
    expect(result.current.employees.length).toBe(0);
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al cargar los empleados');
  });

  it('toggleEmployeeStatus should call service, show toast, and refresh', async () => {
    const { result } = renderHook(() => useEmployees());
    await act(async () => {}); // Initial fetch

    // Store the initial isActive state for the assertion message
    const initialIsActive = mockUser.isActive;

    await act(async () => {
      await result.current.toggleEmployeeStatus(mockUser);
    });

    expect(employeeService.toggleEmployeeStatus).toHaveBeenCalledWith(mockUser.id, !initialIsActive);
    expect(mockShowToast).toHaveBeenCalledWith('success', `Usuario ${initialIsActive ? 'desactivado' : 'activado'} exitosamente`);
    expect(employeeService.getEmployees).toHaveBeenCalledTimes(2); // Initial + refresh
    expect(result.current.processingEmployeeId).toBeNull();
  });

  it('updateEmployee should call service, show toast, refresh, and return true on success', async () => {
    const { result } = renderHook(() => useEmployees());
    await act(async () => {}); 
    const updatedData = { firstName: 'Johnny' };
    let updateResult: boolean | undefined;
    await act(async () => {
      updateResult = await result.current.updateEmployee(mockUser.id, updatedData);
    });

    expect(employeeService.updateEmployee).toHaveBeenCalledWith(mockUser.id, updatedData);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Empleado actualizado exitosamente');
    expect(employeeService.getEmployees).toHaveBeenCalledTimes(2);
    expect(updateResult).toBe(true);
  });
  
  it('createEmployee should call service, show toast, refresh, and return true on success', async () => {
    const { result } = renderHook(() => useEmployees());
    await act(async () => {});
    const newEmployeeData = { email: 'new@example.com', password: 'pass', firstName: 'New', lastName: 'User', role: Role.SALESPERSON };
    let createResult: boolean | undefined;

    await act(async () => {
        createResult = await result.current.createEmployee(newEmployeeData);
    });

    expect(employeeService.createEmployee).toHaveBeenCalledWith(newEmployeeData);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Empleado creado exitosamente');
    expect(employeeService.getEmployees).toHaveBeenCalledTimes(2);
    expect(createResult).toBe(true);
  });

  it('should filter employees based on searchTerm', async () => {
    const { result } = renderHook(() => useEmployees());
    await act(async () => {}); 

    act(() => {
      result.current.setSearchTerm('Jane');
    });
    expect(result.current.employees.length).toBe(1);
    expect(result.current.employees[0].firstName).toBe('Jane');

    act(() => {
      result.current.setSearchTerm('doe');
    });
    expect(result.current.employees.length).toBe(2);

    act(() => {
      result.current.setSearchTerm('nonexistent');
    });
    expect(result.current.employees.length).toBe(0);
  });

  it('handlePageChange should update current page and trigger fetch', async () => {
    vi.mocked(employeeService.getEmployees).mockResolvedValue({
      ...mockEmployeesResponse,
      meta: { ...mockEmployeesResponse.meta, totalPages: 3, page: 1 },
    });
    const { result } = renderHook(() => useEmployees());
    await act(async () => {}); // Initial fetch for page 1

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.handlePageChange(2);
    });
    await act(async () => {}); 
    expect(result.current.currentPage).toBe(2);
    expect(employeeService.getEmployees).toHaveBeenCalledTimes(2); // Initial + page change
    expect(employeeService.getEmployees).toHaveBeenLastCalledWith(2);
  });

}); 