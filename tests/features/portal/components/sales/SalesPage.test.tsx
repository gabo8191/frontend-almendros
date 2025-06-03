/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SalesPage from '../../../../../src/features/portal/components/sales/SalesPage';
import { useSales } from '../../../../../src/features/portal/components/sales/hooks/useSales';
import { useSaleDetails } from '../../../../../src/features/portal/components/sales/hooks/useSaleDetails';
import { Sale } from '../../../../../src/features/portal/api/sale/saleService';
import SalesTable from '../../../../../src/features/portal/components/sales/SalesTable';

// Mock hooks
vi.mock('../../../../../src/features/portal/components/sales/hooks/useSales');
vi.mock('../../../../../src/features/portal/components/sales/hooks/useSaleDetails');

// Mock child components
vi.mock('../../../../../src/features/portal/components/sales/NewSaleModal', () => ({
  default: vi.fn(({ isOpen, onClose, onSaleCreated }) => isOpen ? (
    <div data-testid="mock-new-sale-modal">
      <button data-testid="new-sale-close" onClick={onClose}>Close New</button>
      <button data-testid="new-sale-success" onClick={onSaleCreated}>Create Sale</button>
    </div>
  ) : null),
}));
vi.mock('../../../../../src/features/portal/components/sales/SaleDetailsModal', () => ({
  default: vi.fn(({ isOpen, onClose, sale }) => isOpen ? (
    <div data-testid="mock-sale-details-modal">
      <span>Sale ID: {sale?.id}</span>
      <button data-testid="details-close" onClick={onClose}>Close Details</button>
    </div>
  ) : null),
}));
vi.mock('../../../../../src/features/portal/components/sales/SalesTable', () => ({
  default: vi.fn((_props) => <div data-testid="mock-sales-table">Sales Table</div>),
}));

const mockUseSalesReturn = {
  sales: [] as Sale[],
  isLoading: false,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  totalSales: 0,
  dateFilter: { startDate: '', endDate: '' },
  sortConfig: { field: 'saleDate', direction: 'desc' as 'desc' | 'asc' },
  handleRefresh: vi.fn(),
  handleDateFilterChange: vi.fn(),
  clearFilters: vi.fn(),
  handleSort: vi.fn(),
  handlePageChange: vi.fn(),
  formatDate: vi.fn((date: string) => `Formatted Sales: ${date}`),
  formatCurrency: vi.fn((amount: number) => `Formatted Sales: ${amount}`),
};

const mockUseSaleDetailsReturn = {
  isDetailsModalOpen: false,
  selectedSale: null as Sale | null,
  isFetchingDetails: false,
  handleViewDetails: vi.fn(async () => {}),
  handleCloseDetailsModal: vi.fn(),
  formatDate: vi.fn((date: string) => `Formatted Details: ${date}`),
  formatCurrency: vi.fn((amount: number) => `Formatted Details: ${amount}`),
};

const mockSaleItem: Sale = {
  id: 1, saleDate: '2023-01-01', clientId: 1, totalAmount: 100, details: [],
  createdAt: '', updatedAt: ''
};

describe('SalesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to default state for each test
    Object.assign(mockUseSalesReturn, {
      sales: [], isLoading: false, searchTerm: '', currentPage: 1, totalPages: 1, totalSales: 0,
      dateFilter: { startDate: '', endDate: '' }, sortConfig: { field: 'saleDate', direction: 'desc' as 'desc' | 'asc' },
      setSearchTerm: vi.fn(), handleRefresh: vi.fn(), handleDateFilterChange: vi.fn(),
      clearFilters: vi.fn(), handleSort: vi.fn(), handlePageChange: vi.fn(),
      formatDate: vi.fn((date: string) => `Formatted Sales: ${date}`),
      formatCurrency: vi.fn((amount: number) => `Formatted Sales: ${amount}`),
    });
    Object.assign(mockUseSaleDetailsReturn, {
      isDetailsModalOpen: false, selectedSale: null, isFetchingDetails: false,
      handleViewDetails: vi.fn(async () => {}),
      handleCloseDetailsModal: vi.fn(),
      formatDate: vi.fn((date: string) => `Formatted Details: ${date}`),
      formatCurrency: vi.fn((amount: number) => `Formatted Details: ${amount}`),
    });

    vi.mocked(useSales).mockReturnValue(mockUseSalesReturn);
    vi.mocked(useSaleDetails).mockReturnValue(mockUseSaleDetailsReturn);
  });

  const renderPage = () => render(<SalesPage />); 

  it('should render initial elements', () => {
    renderPage();
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nueva Venta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por ID o cliente...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Fecha inicio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Fecha fin')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, isLoading: true });
    renderPage();
    expect(screen.getByText('Cargando ventas...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-sales-table')).not.toBeInTheDocument();
  });

  describe('Empty States', () => {
    it('should display default empty state when no sales and no filters', () => {
      renderPage(); // isLoading is false, sales is empty
      expect(screen.getByText('No hay ventas registradas')).toBeInTheDocument();
      expect(screen.getByText('Comienza registrando tu primera venta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Registrar Primera Venta' })).toBeInTheDocument();
    });

    it('should display filtered empty state when no sales and searchTerm is active', () => {
      vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, searchTerm: 'test' });
      renderPage();
      expect(screen.getByText('No se encontraron ventas')).toBeInTheDocument();
      expect(screen.getByText('Intenta ajustar los filtros de búsqueda')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Registrar Primera Venta' })).not.toBeInTheDocument();
    });

    it('should display filtered empty state when no sales and dateFilter is active', () => {
      vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, dateFilter: { startDate: '2023-01-01', endDate: '' } });
      renderPage();
      expect(screen.getByText('No se encontraron ventas')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Registrar Primera Venta' })).not.toBeInTheDocument();
    });
  });

  it('should display SalesTable when sales exist', () => {
    vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, sales: [mockSaleItem] });
    renderPage();
    expect(screen.getByTestId('mock-sales-table')).toBeInTheDocument();
  });

  it('should call setSearchTerm on search input change', () => {
    renderPage();
    const searchInput = screen.getByPlaceholderText('Buscar por ID o cliente...');
    fireEvent.change(searchInput, { target: { value: 'search test' } });
    expect(mockUseSalesReturn.setSearchTerm).toHaveBeenCalledWith('search test');
  });

  it('should call handleDateFilterChange on date input change', () => {
    renderPage();
    const startDateInput = screen.getByPlaceholderText('Fecha inicio');
    fireEvent.change(startDateInput, { target: { value: '2023-05-01' } });
    expect(mockUseSalesReturn.handleDateFilterChange).toHaveBeenCalledWith('startDate', '2023-05-01');
  });

  it('should show and call clearFilters when Limpiar button is clicked', () => {
    vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, searchTerm: 'filtered' });
    renderPage();
    const clearButton = screen.getByRole('button', { name: 'Limpiar' });
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);
    expect(mockUseSalesReturn.clearFilters).toHaveBeenCalled();
  });

  it('should not show Limpiar button if no filters active', () => {
    renderPage(); // No filters active by default
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
  });

  it('should call handleRefresh when Actualizar button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(mockUseSalesReturn.handleRefresh).toHaveBeenCalled();
  });

  describe('Modal Interactions', () => {
    it('should open NewSaleModal when "Nueva Venta" is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Nueva Venta' }));
      expect(screen.getByTestId('mock-new-sale-modal')).toBeInTheDocument();
    });

    it('NewSaleModal onClose should close modal', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Nueva Venta' })); // Open modal
      expect(screen.getByTestId('mock-new-sale-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('new-sale-close'));
      expect(screen.queryByTestId('mock-new-sale-modal')).not.toBeInTheDocument();
    });

    it('SalesTable onViewDetails should call useSaleDetails.handleViewDetails and open SaleDetailsModal', () => {
      vi.mocked(useSales).mockReturnValue({ ...mockUseSalesReturn, sales: [mockSaleItem] });
      
      const handleViewDetailsMock = vi.fn(async () => {
        vi.mocked(useSaleDetails).mockReturnValue({
          ...mockUseSaleDetailsReturn,
          isDetailsModalOpen: true,
          selectedSale: mockSaleItem,
          handleViewDetails: handleViewDetailsMock,
        });
      });

      vi.mocked(useSaleDetails).mockReturnValue({
        ...mockUseSaleDetailsReturn,
        handleViewDetails: handleViewDetailsMock,
        isDetailsModalOpen: false,
      });

      let { rerender } = renderPage();
      
      const salesTableComponentMock = vi.mocked(SalesTable);
      const salesTableProps = salesTableComponentMock.mock.lastCall?.[0];
      expect(salesTableProps).toBeDefined();

      act(() => {
        salesTableProps?.onViewDetails(mockSaleItem.id);
      });
      
      rerender(<SalesPage />);

      expect(handleViewDetailsMock).toHaveBeenCalledWith(mockSaleItem.id);
      expect(screen.getByTestId('mock-sale-details-modal')).toBeInTheDocument();
      expect(screen.getByText(`Sale ID: ${mockSaleItem.id}`)).toBeInTheDocument();
    });

    it('SaleDetailsModal onClose should call useSaleDetails.handleCloseDetailsModal', () => {
      vi.mocked(useSaleDetails).mockReturnValue({ ...mockUseSaleDetailsReturn, isDetailsModalOpen: true, selectedSale: mockSaleItem });
      renderPage();
      expect(screen.getByTestId('mock-sale-details-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('details-close'));
      expect(mockUseSaleDetailsReturn.handleCloseDetailsModal).toHaveBeenCalled();
    });
  });

  it('should pass correct props to SalesTable', () => {
    const sales = [mockSaleItem, { ...mockSaleItem, id: 2 }];
    vi.mocked(useSales).mockReturnValue({ 
      ...mockUseSalesReturn, 
      sales,
      totalSales: 2,
      currentPage: 1,
      totalPages: 1,
      sortConfig: { field: 'totalAmount', direction: 'asc' }
    });
    vi.mocked(useSaleDetails).mockReturnValue({
        ...mockUseSaleDetailsReturn,
        isFetchingDetails: true
    });

    renderPage();
    const salesTableComponentMock = vi.mocked(SalesTable);
    expect(salesTableComponentMock).toHaveBeenCalled();
    const props = salesTableComponentMock.mock.lastCall?.[0];

    expect(props?.sales).toEqual(sales);
    expect(props?.totalSales).toBe(2);
    expect(props?.currentPage).toBe(1);
    expect(props?.totalPages).toBe(1);
    expect(props?.isFetchingDetails).toBe(true);
    expect(props?.currentSortConfig).toEqual({ field: 'totalAmount', direction: 'asc' });
    expect(props?.formatDate).toBe(mockUseSalesReturn.formatDate);
    expect(props?.formatCurrency).toBe(mockUseSalesReturn.formatCurrency);
    expect(props?.handlePageChange).toBe(mockUseSalesReturn.handlePageChange);
    expect(props?.onSort).toBe(mockUseSalesReturn.handleSort);
    expect(props?.onViewDetails).toBe(mockUseSaleDetailsReturn.handleViewDetails);
  });

  // Removed "More tests will be added here"
}); 