/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Employees from '../../../../../src/features/portal/components/employees/Employees';
import { useEmployees } from '../../../../../src/features/portal/components/employees/hooks/useEmployees';
import { User as UserType, Role } from '../../../../../src/features/auth/types';

// Mock the hook
vi.mock('../../../../../src/features/portal/components/employees/hooks/useEmployees');

// Mock child components
vi.mock('../../../../../src/features/portal/components/employees/EmployeesTable', () => ({
  default: vi.fn(() => <div data-testid="mock-employees-table">Employees Table</div>),
}));
vi.mock('../../../../../src/features/portal/components/employees/EditEmployeeModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="mock-edit-employee-modal">Edit Modal</div> : null),
}));
vi.mock('../../../../../src/features/portal/components/employees/NewEmployeeModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="mock-new-employee-modal">New Modal</div> : null),
}));

const mockUser: UserType = {
  id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: Role.SALESPERSON, isActive: true, createdAt: '', updatedAt: ''
};

const mockUseEmployeesReturn = {
  employees: [] as UserType[],
  isLoading: false,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  processingEmployeeId: null,
  toggleEmployeeStatus: vi.fn(),
  updateEmployee: vi.fn(),
  createEmployee: vi.fn(),
  handlePageChange: vi.fn(),
  refreshEmployees: vi.fn(),
};

describe('Employees Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return values for each test
    mockUseEmployeesReturn.employees = [];
    mockUseEmployeesReturn.isLoading = false;
    mockUseEmployeesReturn.searchTerm = '';
    mockUseEmployeesReturn.setSearchTerm = vi.fn();
    mockUseEmployeesReturn.refreshEmployees = vi.fn();
    vi.mocked(useEmployees).mockReturnValue(mockUseEmployeesReturn);
  });

  it('should render title, search input, and action buttons', () => {
    render(<Employees />);
    expect(screen.getByText('Gestión de Empleados')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar empleados...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo Empleado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument();
  });

  it('should render loading state', () => {
    vi.mocked(useEmployees).mockReturnValue({ ...mockUseEmployeesReturn, isLoading: true });
    render(<Employees />);
    expect(screen.getByText('Cargando empleados...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-employees-table')).not.toBeInTheDocument();
  });

  it('should render empty state when no employees and no search term', () => {
    render(<Employees />);
    expect(screen.getByText('No hay empleados registrados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Primer Empleado/i })).toBeInTheDocument(); // Specific button for this empty state
  });

  it('should render empty state when no employees for a search term', () => {
    vi.mocked(useEmployees).mockReturnValue({ ...mockUseEmployeesReturn, searchTerm: 'xyz' });
    render(<Employees />);
    expect(screen.getByText('No se encontraron empleados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Crear Primer Empleado/i })).not.toBeInTheDocument(); 
  });

  it('should render EmployeesTable when employees exist', () => {
    vi.mocked(useEmployees).mockReturnValue({ ...mockUseEmployeesReturn, employees: [mockUser] });
    render(<Employees />);
    expect(screen.getByTestId('mock-employees-table')).toBeInTheDocument();
  });

  it('should call setSearchTerm on search input change', () => {
    render(<Employees />);
    const searchInput = screen.getByPlaceholderText('Buscar empleados...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(mockUseEmployeesReturn.setSearchTerm).toHaveBeenCalledWith('test search');
  });

  it('should open NewEmployeeModal when "Nuevo Empleado" button is clicked', () => {
    render(<Employees />);
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Empleado/i }));
    expect(screen.getByTestId('mock-new-employee-modal')).toBeInTheDocument();
  });

  it('should call refreshEmployees when "Actualizar" button is clicked', () => {
    render(<Employees />);
    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));
    expect(mockUseEmployeesReturn.refreshEmployees).toHaveBeenCalledTimes(1);
  });
}); 