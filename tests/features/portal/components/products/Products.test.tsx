/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductsComponent from '../../../../../src/features/portal/components/products/Products';
import { useProducts } from '../../../../../src/features/portal/components/products/Hooks/useProducts';
import { Product } from '../../../../../src/features/portal/api/product/types';

// Import the child components to mock their props correctly
import ProductsHeader from '../../../../../src/features/portal/components/products/ProductsHeader';
import ProductsTable from '../../../../../src/features/portal/components/products/ProductsTable';
import EditProductModal from '../../../../../src/features/portal/components/products/EditProductModal';

// Mock the hook
vi.mock('../../../../../src/features/portal/components/products/Hooks/useProducts');

// Mock child components
vi.mock('../../../../../src/features/portal/components/products/ProductsHeader', () => ({
  default: vi.fn(() => <div data-testid="mock-products-header">Products Header</div>),
}));
vi.mock('../../../../../src/features/portal/components/products/LowStockAlert', () => ({
  default: vi.fn(() => <div data-testid="mock-low-stock-alert">Low Stock Alert</div>),
}));
vi.mock('../../../../../src/features/portal/components/products/ProductsTable', () => ({
  default: vi.fn(() => <div data-testid="mock-products-table">Products Table</div>),
}));
vi.mock('../../../../../src/features/portal/components/products/NewProductModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="mock-new-product-modal">New Modal</div> : null),
}));
vi.mock('../../../../../src/features/portal/components/products/EditProductModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="mock-edit-product-modal">Edit Modal</div> : null),
}));

const mockProductInstance: Product = {
  id: 1, name: 'Test Prod', description: '', minQuantity: 1, maxQuantity: 10, supplierId: 1,
  purchasePrice: 10, sellingPrice: 20, currentStock: 5, isActive: true, createdAt: '', updatedAt: ''
};

const mockUseProductsReturn = {
  products: [] as Product[],
  isLoading: false,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  lowStockProducts: [] as Product[],
  isAdmin: false,
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  handleEditProduct: vi.fn((p: Product) => p),
  handleAdjustStock: vi.fn(),
  handlePageChange: vi.fn(),
  refreshProducts: vi.fn(), 
  formatPrice: vi.fn(),
  getCurrentPrices: vi.fn(),
  getStockStatus: vi.fn(),
};

describe('Products Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProductsReturn.products = [];
    mockUseProductsReturn.isLoading = false;
    mockUseProductsReturn.searchTerm = '';
    mockUseProductsReturn.lowStockProducts = [];
    mockUseProductsReturn.isAdmin = false;
    mockUseProductsReturn.setSearchTerm = vi.fn();
    mockUseProductsReturn.createProduct = vi.fn().mockResolvedValue(true);
    mockUseProductsReturn.updateProduct = vi.fn().mockResolvedValue(true);
    mockUseProductsReturn.refreshProducts = vi.fn();
    vi.mocked(useProducts).mockReturnValue(mockUseProductsReturn);
  });

  it('should render search input and child components', () => {
    render(<ProductsComponent />);
    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
    expect(screen.getByTestId('mock-products-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-low-stock-alert')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useProducts).mockReturnValue({ ...mockUseProductsReturn, isLoading: true });
    render(<ProductsComponent />);
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-products-table')).not.toBeInTheDocument();
  });

  it('should display empty state when no products and no search term (non-admin)', () => {
    render(<ProductsComponent />);
    expect(screen.getByText('Aún no hay productos registrados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Crear primer producto/i })).not.toBeInTheDocument();
  });

  it('should display empty state with create button for admin when no products and no search term', () => {
    vi.mocked(useProducts).mockReturnValue({ ...mockUseProductsReturn, isAdmin: true });
    render(<ProductsComponent />);
    expect(screen.getByText('Aún no hay productos registrados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear primer producto/i })).toBeInTheDocument();
  });

  it('should display empty state for search results', () => {
    vi.mocked(useProducts).mockReturnValue({ ...mockUseProductsReturn, searchTerm: 'xyz' });
    render(<ProductsComponent />);
    expect(screen.getByText('No hay resultados para tu búsqueda')).toBeInTheDocument();
  });

  it('should display ProductsTable when products exist', () => {
    vi.mocked(useProducts).mockReturnValue({ ...mockUseProductsReturn, products: [mockProductInstance] });
    render(<ProductsComponent />);
    expect(screen.getByTestId('mock-products-table')).toBeInTheDocument();
  });

  it('should call setSearchTerm on search input change', () => {
    render(<ProductsComponent />);
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'search test' } });
    expect(mockUseProductsReturn.setSearchTerm).toHaveBeenCalledWith('search test');
  });

  it('ProductsHeader receives onNewProduct and calls it, opening NewProductModal', () => {
    render(<ProductsComponent />);
    const headerProps = vi.mocked(ProductsHeader).mock.lastCall?.[0];
    expect(headerProps).toBeDefined();
    act(() => {
      headerProps?.onNewProduct();
    });
    expect(screen.getByTestId('mock-new-product-modal')).toBeInTheDocument();
  });

  it('ProductsTable receives onEditProduct and calls it, opening EditProductModal', () => {
    vi.mocked(useProducts).mockReturnValue({ ...mockUseProductsReturn, products: [mockProductInstance] });
    render(<ProductsComponent />);
    const tableProps = vi.mocked(ProductsTable).mock.lastCall?.[0];
    expect(tableProps).toBeDefined();
    act(() => {
      tableProps?.onEditProduct(mockProductInstance);
    });
    expect(screen.getByTestId('mock-edit-product-modal')).toBeInTheDocument();
    expect(vi.mocked(EditProductModal)).toHaveBeenCalledWith(expect.objectContaining({ product: mockProductInstance, isOpen: true }), {});
  });

}); 