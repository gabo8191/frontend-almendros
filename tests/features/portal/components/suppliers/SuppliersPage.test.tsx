/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SuppliersPage from '../../../../../src/features/portal/components/suppliers/SuppliersPage';
import { supplierService, Supplier } from '../../../../../src/features/portal/api/supplier/supplierService';
import { useToast } from '../../../../../src/shared/context/ToastContext';
import { useAuth } from '../../../../../src/features/auth/context/AuthContext';
import { Role, User } from '../../../../../src/features/auth/types';
import SuppliersTable from '../../../../../src/features/portal/components/suppliers/SuppliersTable'; // For vi.mocked typing

// Mock services and hooks
vi.mock('../../../../../src/features/portal/api/supplier/supplierService');
vi.mock('../../../../../src/shared/context/ToastContext');
vi.mock('../../../../../src/features/auth/context/AuthContext');

// Mock child components
vi.mock('../../../../../src/features/portal/components/suppliers/NewSupplierModal', () => ({
  default: vi.fn(({ isOpen, onClose, onSave }) => isOpen ? (
    <div data-testid="mock-new-supplier-modal">
      <button data-testid="new-supplier-close" onClick={onClose}>Close New</button>
      <button data-testid="new-supplier-success" onClick={onSave}>Create Supplier</button>
    </div>
  ) : null),
}));
vi.mock('../../../../../src/features/portal/components/suppliers/EditSupplierModal', () => ({
  default: vi.fn(({ isOpen, onClose, onSave, supplier }) => isOpen ? (
    <div data-testid="mock-edit-supplier-modal">
      <span>Editing: {supplier?.name}</span>
      <button data-testid="edit-supplier-close" onClick={onClose}>Close Edit</button>
      <button data-testid="edit-supplier-success" onClick={onSave}>Update Supplier</button>
    </div>
  ) : null),
}));
vi.mock('../../../../../src/features/portal/components/suppliers/SuppliersTable', () => ({
  default: vi.fn((_props) => <div data-testid="mock-suppliers-table">Suppliers Table</div>),
}));

const mockShowToast = vi.fn();
const mockAdminUser: User = { id: 'admin', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: Role.ADMINISTRATOR, isActive: true, createdAt: '', updatedAt: '' };
const mockNonAdminUser: User = { ...mockAdminUser, role: Role.SALESPERSON };

const mockSupplier1: Supplier = {
  id: 1,
  name: 'Supplier Alpha',
  contactName: 'Contact A',
  email: 'alpha@supplier.com',
  phoneNumber: '1111111',
  address: '123 Alpha St',
  documentType: 'NIT',
  documentNumber: '12345-1',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const mockSupplier2: Supplier = {
  id: 2,
  name: 'Supplier Beta',
  contactName: 'Contact B',
  email: 'beta@supplier.com',
  phoneNumber: '2222222',
  address: '456 Beta St',
  documentType: 'CC',
  documentNumber: '67890',
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSuppliersResponse = {
  data: [mockSupplier1, mockSupplier2],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  message: 'Success',
};

describe('SuppliersPage Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(useAuth).mockReturnValue({ user: mockAdminUser, isAuthenticated: true } as any);
    vi.mocked(supplierService.getSuppliers).mockResolvedValue(mockSuppliersResponse);
    vi.mocked(supplierService.activateSupplier).mockResolvedValue(undefined);
    vi.mocked(supplierService.deactivateSupplier).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderPage = () => render(<SuppliersPage />); 

  it('should render initial elements and fetch suppliers', async () => {
    renderPage();
    await act(async () => { vi.advanceTimersByTime(100); }); // Give useEffects time to run

    expect(screen.getByText('Proveedores')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar proveedores...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo Proveedor' })).toBeInTheDocument(); // Admin view
    expect(supplierService.getSuppliers).toHaveBeenCalledTimes(2);
    expect(supplierService.getSuppliers).toHaveBeenNthCalledWith(1, 1, 10, { search: undefined });
    expect(supplierService.getSuppliers).toHaveBeenNthCalledWith(2, 1, 10, { search: undefined });
    expect(screen.getByTestId('mock-suppliers-table')).toBeInTheDocument();
  });

  it('should not show "Nuevo Proveedor" button for non-admin user', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockNonAdminUser, isAuthenticated: true } as any);
    renderPage();
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(screen.queryByRole('button', { name: 'Nuevo Proveedor' })).not.toBeInTheDocument();
  });

  it('should display loading state', async () => {
    vi.mocked(supplierService.getSuppliers).mockImplementation(() => new Promise(() => {})); 
    renderPage();
    expect(screen.getByText('Cargando proveedores...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-suppliers-table')).not.toBeInTheDocument();
    vi.mocked(supplierService.getSuppliers).mockResolvedValue(mockSuppliersResponse);
  });

  describe('Empty States', () => {
    it('should display default empty state when no suppliers and no search term', async () => {
      vi.mocked(supplierService.getSuppliers).mockResolvedValue({ ...mockSuppliersResponse, data: [], meta: {...mockSuppliersResponse.meta, total: 0} });
      renderPage();
      await act(async () => { vi.advanceTimersByTime(100); });
      expect(screen.getByText('Aún no hay proveedores registrados')).toBeInTheDocument();
    });

    it('should display filtered empty state when no suppliers and search term is active', async () => {
      vi.mocked(supplierService.getSuppliers).mockResolvedValue({ ...mockSuppliersResponse, data: [], meta: {...mockSuppliersResponse.meta, total: 0} });
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Buscar proveedores...'), { target: { value: 'test' } });
      await act(async () => { vi.advanceTimersByTime(100); });
      expect(screen.getByText('No hay resultados para tu búsqueda')).toBeInTheDocument();
    });
  });

  it('should call getSuppliers with search term on input change', async () => {
    renderPage();
    await act(async () => { vi.advanceTimersByTime(100); }); // Initial fetches
    vi.mocked(supplierService.getSuppliers).mockClear(); // Clear previous calls

    fireEvent.change(screen.getByPlaceholderText('Buscar proveedores...'), { target: { value: 'search test' } });
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(supplierService.getSuppliers).toHaveBeenCalledWith(1, 10, { search: 'search test' });
  });

  it('should handle page changes', async () => {
    renderPage();
    await act(async () => { vi.advanceTimersByTime(100); }); // Initial fetch
    vi.mocked(supplierService.getSuppliers).mockClear();

    // Simulate SuppliersTable calling handlePageChange
    const suppliersTableProps = vi.mocked(SuppliersTable).mock.lastCall?.[0];
    act(() => {
      suppliersTableProps?.handlePageChange(2);
    });
    await act(async () => { vi.advanceTimersByTime(100); });

    // currentPage change triggers useEffect -> fetchSuppliers
    expect(supplierService.getSuppliers).toHaveBeenCalledWith(2, 10, { search: undefined });
  });

  describe('Toggle Supplier Status', () => {
    it('should call deactivateSupplier and refresh for an active supplier', async () => {
      renderPage();
      await act(async () => { vi.advanceTimersByTime(100); });
      vi.mocked(supplierService.getSuppliers).mockClear();

      const suppliersTableProps = vi.mocked(SuppliersTable).mock.lastCall?.[0];
      act(() => {
        suppliersTableProps?.toggleSupplierStatus(mockSupplier1); // mockSupplier1 is active
      });
      await act(async () => { vi.advanceTimersByTime(100); }); // For service call and refresh

      expect(supplierService.deactivateSupplier).toHaveBeenCalledWith(mockSupplier1.id);
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Proveedor desactivado exitosamente');
      expect(supplierService.getSuppliers).toHaveBeenCalledTimes(1); // For the refresh
    });

    it('should call activateSupplier and refresh for an inactive supplier', async () => {
      renderPage();
      await act(async () => { vi.advanceTimersByTime(100); });
      vi.mocked(supplierService.getSuppliers).mockClear();

      const suppliersTableProps = vi.mocked(SuppliersTable).mock.lastCall?.[0];
      act(() => {
        suppliersTableProps?.toggleSupplierStatus(mockSupplier2); // mockSupplier2 is inactive
      });
      await act(async () => { vi.advanceTimersByTime(100); });

      expect(supplierService.activateSupplier).toHaveBeenCalledWith(mockSupplier2.id);
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Proveedor activado exitosamente');
      expect(supplierService.getSuppliers).toHaveBeenCalledTimes(1);
    });

    it('should show error toast if toggling status fails', async () => {
      vi.mocked(supplierService.deactivateSupplier).mockRejectedValueOnce(new Error('Toggle failed'));
      renderPage();
      await act(async () => { vi.advanceTimersByTime(100); });

      const suppliersTableProps = vi.mocked(SuppliersTable).mock.lastCall?.[0];
      act(() => {
        suppliersTableProps?.toggleSupplierStatus(mockSupplier1);
      });
      await act(async () => { vi.advanceTimersByTime(100); });

      expect(mockShowToast).toHaveBeenCalledWith('error', 'Error al cambiar el estado del proveedor');
    });
  });

  it('should pass correct props to SuppliersTable', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockAdminUser, isAuthenticated: true } as any);
    renderPage();
    await act(async () => { vi.advanceTimersByTime(100); });

    const suppliersTableMock = vi.mocked(SuppliersTable);
    expect(suppliersTableMock).toHaveBeenCalled();
    const props = suppliersTableMock.mock.lastCall?.[0];

    expect(props?.suppliers).toEqual([mockSupplier1, mockSupplier2]);
    expect(props?.isAdmin).toBe(true);
    expect(props?.processingSupplierId).toBeNull();
    expect(props?.currentPage).toBe(1);
    expect(props?.totalPages).toBe(1);
    expect(props?.toggleSupplierStatus).toBeInstanceOf(Function);
    expect(props?.handlePageChange).toBeInstanceOf(Function);
    expect(props?.onEditClick).toBeInstanceOf(Function);
  });
}); 