/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryMovements from '../../../../../src/features/portal/components/inventory/InventoryMovements';
import { useInventoryMovements } from '../../../../../src/features/portal/components/inventory/hooks/useInventoryMovements';
import { useAuth } from '../../../../../src/features/auth/context/AuthContext';
import { Role, User } from '../../../../../src/features/auth/types';
import { InventoryMovement, MovementType } from '../../../../../src/features/portal/api/inventory/inventoryService';

// Mock hooks
vi.mock('../../../../../src/features/portal/components/inventory/hooks/useInventoryMovements');
vi.mock('../../../../../src/features/auth/context/AuthContext');

// Mock child components
vi.mock('../../../../../src/features/portal/components/inventory/InventoryMovementsTable', () => ({
  default: vi.fn(() => <div data-testid="mock-inventory-movements-table">Movements Table</div>),
}));
vi.mock('../../../../../src/features/portal/components/inventory/NewMovementModal', () => ({
  default: vi.fn(({ isOpen, type }) => isOpen ? <div data-testid={`mock-new-movement-modal-${type}`}>New Modal</div> : null),
}));

const mockMovement: InventoryMovement = {
  id: 1, type: 'ENTRY', quantity: 10, reason: 'Test', movementDate: '', 
  product: { id: 1, name: 'Prod', description: '', currentStock: 10 }, 
  user: { id: 'u1', firstName: 'U', lastName: 'Ser', email: 'e' }, 
  createdAt: '', updatedAt: ''
};

const mockUseInventoryMovementsReturn = {
  movements: [mockMovement],
  isLoading: false,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  selectedMovementType: '' as MovementType | '',
  setSelectedMovementType: vi.fn(),
  createMovement: vi.fn(),
  handlePageChange: vi.fn(),
  refreshMovements: vi.fn(),
  formatDate: vi.fn((dateStr) => new Date(dateStr).toLocaleDateString()),
};

const mockAdminUser: Partial<User> = { id: 'admin1', role: Role.ADMINISTRATOR, email: 'admin@mail.com', firstName:'Admin', lastName:'User' };
const mockSalesUser: Partial<User> = { id: 'sales1', role: Role.SALESPERSON, email: 'sales@mail.com', firstName:'Sales', lastName:'User' };

const mockUseAuthAdmin = {
  user: mockAdminUser,
  isLoading: false,
  isAuthenticated: true,
  login: vi.fn(), logout: vi.fn(), updateUser: vi.fn(), setLoading: vi.fn(), hasPermission: vi.fn(() => true), 
  token: 'token', register: vi.fn(), createdAt: '', updatedAt: ''
};
const mockUseAuthSales = {
  ...mockUseAuthAdmin,
  user: mockSalesUser,
  hasPermission: vi.fn(() => false),
};

describe('InventoryMovements Component', () => {
  const setup = (authHookReturn = mockUseAuthAdmin) => {
    vi.mocked(useInventoryMovements).mockReturnValue(mockUseInventoryMovementsReturn);
    vi.mocked(useAuth).mockReturnValue(authHookReturn as any); // Cast because mock is partial
    render(<InventoryMovements />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInventoryMovementsReturn.setSearchTerm = vi.fn();
    mockUseInventoryMovementsReturn.setSelectedMovementType = vi.fn();
    mockUseInventoryMovementsReturn.createMovement = vi.fn().mockResolvedValue(true);
  });

  it('should render basic elements', () => {
    setup();
    expect(screen.getByText('Movimientos de Inventario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por razón...')).toBeInTheDocument();
    
    const typeFilter = screen.getByRole('combobox');
    expect(typeFilter).toBeInTheDocument();
    expect(typeFilter).toHaveValue('');
    
    expect(screen.getByTestId('mock-inventory-movements-table')).toBeInTheDocument();
  });

  it('should show admin buttons for admin user', () => {
    setup(mockUseAuthAdmin);
    expect(screen.getByRole('button', { name: /Registrar Salida/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Entrada/i })).toBeInTheDocument();
  });

  it('should NOT show admin buttons for non-admin user', () => {
    setup(mockUseAuthSales);
    expect(screen.queryByRole('button', { name: /Registrar Salida/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar Entrada/i })).not.toBeInTheDocument();
  });

  it('should call setSearchTerm on search input change', () => {
    setup();
    const searchInput = screen.getByPlaceholderText('Buscar por razón...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(mockUseInventoryMovementsReturn.setSearchTerm).toHaveBeenCalledWith('test search');
  });

  it('should call setSelectedMovementType on type filter change', () => {
    setup();
    const typeFilter = screen.getByRole('combobox');
    fireEvent.change(typeFilter, { target: { value: 'ENTRY' } });
    expect(mockUseInventoryMovementsReturn.setSelectedMovementType).toHaveBeenCalledWith('ENTRY');
  });

  it('should open NewMovementModal with type ENTRY for "Registrar Entrada"', () => {
    setup(mockUseAuthAdmin);
    fireEvent.click(screen.getByRole('button', { name: /Registrar Entrada/i }));
    expect(screen.getByTestId('mock-new-movement-modal-ENTRY')).toBeInTheDocument();
  });

  it('should open NewMovementModal with type EXIT for "Registrar Salida"', () => {
    setup(mockUseAuthAdmin);
    fireEvent.click(screen.getByRole('button', { name: /Registrar Salida/i }));
    expect(screen.getByTestId('mock-new-movement-modal-EXIT')).toBeInTheDocument();
  });

}); 