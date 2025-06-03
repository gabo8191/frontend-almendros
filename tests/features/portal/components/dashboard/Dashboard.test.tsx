/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../../../../src/features/portal/components/dashboard/Dashboard';
import { useAuth } from '../../../../../src/features/auth/context/AuthContext';
import { useDashboard, DashboardStats, RecentSale } from '../../../../../src/features/portal/components/dashboard/hooks/useDashboard';
import { Role } from '../../../../../src/features/auth/types';

// Mock hooks
vi.mock('../../../../../src/features/auth/context/AuthContext');
vi.mock('../../../../../src/features/portal/components/dashboard/hooks/useDashboard');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components
vi.mock('../../../../../src/features/portal/components/dashboard/DashboardCard.tsx ', () => ({
  default: vi.fn(({ title, value, subtitle, icon: Icon, color, onClick, isLoading }) => (
    <div data-testid={`mock-dashboard-card-${title?.toLowerCase().replace(/\s+/g, '-')}`} onClick={onClick}>
      <h3>{title}</h3>
      <p>{isLoading ? 'Card Loading...' : value}</p>
      <span>{subtitle}</span>
      {Icon && <Icon size={24} data-testid="mock-icon" />}
      <span data-testid="mock-card-color">{color}</span>
    </div>
  )),
}));

vi.mock('../../../../../src/features/portal/components/dashboard/QuickActions', () => ({
  default: vi.fn(({ onNewSale, isAdmin }) => (
    <div data-testid="mock-quick-actions">
      <button onClick={onNewSale}>New Sale (QuickAction)</button>
      <span>Admin: {isAdmin ? 'true' : 'false'}</span>
    </div>
  )),
}));

vi.mock('../../../../../src/features/portal/components/sales/NewSaleModal', () => ({
  default: vi.fn(({ isOpen, onClose, onSaleCreated }) => 
    isOpen ? (
      <div data-testid="mock-new-sale-modal">
        Mock NewSaleModal
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSaleCreated}>Create Sale (Modal)</button>
      </div>
    ) : null
  ),
}));

// Default mock return values
const mockUseAuthAdmin = {
  user: { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: Role.ADMINISTRATOR, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  isLoading: false,
  isAuthenticated: true,
  setUser: vi.fn(),
  hasPermission: () => true,
};

const mockUseAuthUser = {
  ...mockUseAuthAdmin,
  user: { ...mockUseAuthAdmin.user, firstName:'Regular', role: Role.SALESPERSON },
  hasPermission: (role: Role) => role !== Role.ADMINISTRATOR,
};

const mockRecentSale: RecentSale = {
  id: 1,
  clientName: 'Test Client Sale',
  total: 1000,
  date: new Date().toISOString(),
};

const mockDashboardStats: DashboardStats = {
  todaySales: { total: 1500, count: 5 },
  thisWeekSales: { total: 7500, count: 25 },
  lowStockProducts: 3,
  totalProducts: 100,
  totalClients: 50,
  recentSales: [mockRecentSale, { ...mockRecentSale, id: 2, clientName: 'Another Client', total: 2000 }],
  isLoading: false,
};

const mockUseDashboardReturn = {
  stats: mockDashboardStats,
  formatCurrency: vi.fn((val) => `$${Number(val).toFixed(2)}`),
  formatDate: vi.fn((dateStr) => new Date(dateStr).toLocaleDateString()),
  refreshData: vi.fn(),
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to admin user
    vi.mocked(useAuth).mockReturnValue(mockUseAuthAdmin);
    vi.mocked(useDashboard).mockReturnValue(mockUseDashboardReturn);
  });

  it('should render loading state correctly', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...mockUseDashboardReturn,
      stats: { ...mockDashboardStats, isLoading: true },
    });
    render(<Dashboard />);
    // Check for loading state in cards
    expect(screen.getByTestId('mock-dashboard-card-ventas-de-hoy')).toHaveTextContent('Card Loading...');
    // Check for shimmer in recent sales
    const shimmerSection = screen.getByText('Ventas Recientes').closest('div.bg-white');
    expect(shimmerSection?.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render correctly for a non-admin (salesperson) user', () => {
    vi.mocked(useAuth).mockReturnValue(mockUseAuthUser); // Switch to non-admin
    render(<Dashboard />);

    // Check QuickActions
    expect(screen.getByTestId('mock-quick-actions')).toHaveTextContent('Admin: false');
    // Other assertions can be added if the view significantly differs for non-admins beyond QuickActions
  });

  it('should open NewSaleModal when "Nueva Venta" is clicked in QuickActions', () => {
    render(<Dashboard />);
    expect(screen.queryByTestId('mock-new-sale-modal')).not.toBeInTheDocument();

    // The button is inside the mocked QuickActions component
    const newSaleButton = screen.getByRole('button', { name: /New Sale \(QuickAction\)/i });
    fireEvent.click(newSaleButton);

    expect(screen.getByTestId('mock-new-sale-modal')).toBeInTheDocument();
  });

  it('should close NewSaleModal and refresh data on sale creation', () => {
    render(<Dashboard />);

    // Open the modal first
    const newSaleButton = screen.getByRole('button', { name: /New Sale \(QuickAction\)/i });
    fireEvent.click(newSaleButton);
    expect(screen.getByTestId('mock-new-sale-modal')).toBeInTheDocument();

    // Simulate sale creation from the modal
    // The "Create Sale (Modal)" button is part of the NewSaleModal mock
    const createSaleButtonInModal = screen.getByRole('button', { name: /Create Sale \(Modal\)/i });
    fireEvent.click(createSaleButtonInModal);

    // Assert modal is closed
    expect(screen.queryByTestId('mock-new-sale-modal')).not.toBeInTheDocument();
    // Assert refreshData was called
    expect(mockUseDashboardReturn.refreshData).toHaveBeenCalledTimes(1);
  });
  
  it('should close NewSaleModal when its close button is clicked', () => {
    render(<Dashboard />);

    // Open the modal first
    const newSaleButton = screen.getByRole('button', { name: /New Sale \(QuickAction\)/i });
    fireEvent.click(newSaleButton);
    expect(screen.getByTestId('mock-new-sale-modal')).toBeInTheDocument();
    
    // Simulate clicking the close button inside the modal
    // The "Close Modal" button is part of the NewSaleModal mock
    const closeModalButton = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeModalButton);

    // Assert modal is closed
    expect(screen.queryByTestId('mock-new-sale-modal')).not.toBeInTheDocument();
    expect(mockUseDashboardReturn.refreshData).not.toHaveBeenCalled(); // Ensure refresh wasn't called on simple close
  });

  it('should navigate when dashboard cards are clicked', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByTestId('mock-dashboard-card-ventas-de-hoy'));
    expect(mockNavigate).toHaveBeenCalledWith('/portal/sales');

    const weekSalesCardForClick = screen.getByText('Ventas de la Semana').closest('div[data-testid^="mock-dashboard-card-"]');
    expect(weekSalesCardForClick).toBeInTheDocument(); // Ensure we found it before clicking
    if (weekSalesCardForClick) fireEvent.click(weekSalesCardForClick);
    expect(mockNavigate).toHaveBeenCalledWith('/portal/sales');

    fireEvent.click(screen.getByTestId('mock-dashboard-card-total-productos'));
    expect(mockNavigate).toHaveBeenCalledWith('/portal/pos');

    fireEvent.click(screen.getByTestId('mock-dashboard-card-total-clientes'));
    expect(mockNavigate).toHaveBeenCalledWith('/portal/clients');
  });

  it('should navigate when "Ver todas" for recent sales is clicked', () => {
    render(<Dashboard />);
    const viewAllSalesButton = screen.getByRole('button', { name: /Ver todas/i });
    fireEvent.click(viewAllSalesButton);
    expect(mockNavigate).toHaveBeenCalledWith('/portal/sales');
  });

  it('should navigate when "Ver Productos" in low stock section is clicked', () => {
    // Ensure low stock section is visible by having lowStockProducts > 0 (default mock is 3)
    render(<Dashboard />);
    const viewProductsButton = screen.getByRole('button', { name: /Ver Productos/i });
    fireEvent.click(viewProductsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/portal/pos');
  });

  it('should not show low stock section if lowStockProducts is 0', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...mockUseDashboardReturn,
      stats: { ...mockDashboardStats, lowStockProducts: 0 },
    });
    render(<Dashboard />);
    expect(screen.queryByRole('button', { name: /Ver Productos/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Productos con Bajo Stock')).not.toBeInTheDocument();
  });

  it('should call refreshData when "Actualizar" button is clicked', () => {
    render(<Dashboard />);
    const refreshButton = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(refreshButton);
    expect(mockUseDashboardReturn.refreshData).toHaveBeenCalledTimes(1);
  });

  // More tests will go here...
}); 