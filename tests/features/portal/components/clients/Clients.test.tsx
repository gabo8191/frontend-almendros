/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Clients from '../../../../../src/features/portal/components/clients/Clients';
import { useClients } from '../../../../../src/features/portal/components/clients/hooks/useClients';

// Mock the useClients hook
vi.mock('../../../../../src/features/portal/components/clients/hooks/useClients');

// Mock child components that are not the focus of these unit tests
vi.mock('../../../../../src/features/portal/components/clients/ClientsTable', () => ({
  default: vi.fn(({ onEditClick, clients }) => (
    <div data-testid="mock-clients-table">
      Mocked ClientsTable - Clients: {clients.length}
      {/* Simulate an edit click for testing */} 
      {clients.length > 0 && <button onClick={() => onEditClick(clients[0])}>Edit First Client</button>}
    </div>
  )),
}));

vi.mock('../../../../../src/features/portal/components/clients/EditClientModal', () => ({
  default: vi.fn(({ isOpen, onClose, onSave, client }) => 
    isOpen ? (
      <div data-testid="mock-edit-client-modal">
        Mocked EditClientModal for {client?.name}
        <button onClick={onClose}>Close Edit</button>
        <button onClick={() => onSave({ name: 'updated by mock' })}>Save Edit</button>
      </div>
    ) : null
  ),
}));

vi.mock('../../../../../src/features/portal/components/clients/NewClient', () => ({ // Assuming NewClient is the NewClientModal
  default: vi.fn(({ isOpen, onClose, onSave }) => 
    isOpen ? (
      <div data-testid="mock-new-client-modal">
        Mocked NewClientModal
        <button onClick={onClose}>Close New</button>
        <button onClick={() => onSave({ name: 'new from mock' })}>Save New</button>
      </div>
    ) : null
  ),
}));

// Default mock return values for useClients
const mockUseClientsReturnValue = {
  clients: [],
  isLoading: false,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  totalClients: 0,
  processingClientId: null,
  isAdmin: true, // Default to admin for most positive test cases
  toggleClientStatus: vi.fn(),
  updateClient: vi.fn().mockResolvedValue(true),
  createClient: vi.fn().mockResolvedValue(true),
  handlePageChange: vi.fn(),
  refreshClients: vi.fn(),
  selectedClient: null, // these are not from useClients, but local to Clients.tsx
  isEditModalOpen: false,
  isNewClientModalOpen: false,
};

describe('Clients Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock for useClients before each test
    vi.mocked(useClients).mockReturnValue(mockUseClientsReturnValue);
  });

  it('should render loading state', () => {
    vi.mocked(useClients).mockReturnValue({ ...mockUseClientsReturnValue, isLoading: true });
    render(<Clients />);
    expect(screen.getByText('Cargando clientes...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-clients-table')).not.toBeInTheDocument();
  });

  it('should render empty state when no clients and no search term', () => {
    vi.mocked(useClients).mockReturnValue({
      ...mockUseClientsReturnValue,
      isLoading: false,
      clients: [],
      totalClients: 0,
      searchTerm: '',
    });
    render(<Clients />);
    expect(screen.getByText('No hay clientes registrados')).toBeInTheDocument();
    expect(screen.getByText('Comienza agregando tu primer cliente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Primer Cliente/i })).toBeInTheDocument();
    expect(screen.queryByTestId('mock-clients-table')).not.toBeInTheDocument();
  });

  it('should render empty state when no clients found for a search term', () => {
    vi.mocked(useClients).mockReturnValue({
      ...mockUseClientsReturnValue,
      isLoading: false,
      clients: [],
      totalClients: 0,
      searchTerm: 'nonexistentclient',
    });
    render(<Clients />);
    expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
    expect(screen.getByText('Intenta ajustar los términos de búsqueda')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Crear Primer Cliente/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-clients-table')).not.toBeInTheDocument();
  });

  it('should render clients table when clients exist', () => {
    const mockClients = [
      { id: 1, name: 'Client Alpha', email: 'alpha@test.com', isActive: true, documentNumber: '1', documentType: 'ID', address: '-', phoneNumber: '-', createdAt: '', updatedAt: '' },
      { id: 2, name: 'Client Beta', email: 'beta@test.com', isActive: false, documentNumber: '2', documentType: 'ID', address: '-', phoneNumber: '-', createdAt: '', updatedAt: '' },
    ];
    vi.mocked(useClients).mockReturnValue({
      ...mockUseClientsReturnValue,
      isLoading: false,
      clients: mockClients,
      totalClients: mockClients.length,
    });
    render(<Clients />);
    expect(screen.getByTestId('mock-clients-table')).toBeInTheDocument();
    expect(screen.getByText(`Mocked ClientsTable - Clients: ${mockClients.length}`)).toBeInTheDocument();
    expect(screen.getByText('Gestión de Clientes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por nombre, email o documento...')).toBeInTheDocument();
  });

  it('should call setSearchTerm when typing in search input', () => {
    const setSearchTermMock = vi.fn();
    vi.mocked(useClients).mockReturnValue({
      ...mockUseClientsReturnValue,
      setSearchTerm: setSearchTermMock,
    });
    render(<Clients />);
    const searchInput = screen.getByPlaceholderText('Buscar por nombre, email o documento...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(setSearchTermMock).toHaveBeenCalledWith('test search');
  });

  it('should open NewClientModal when "Nuevo Cliente" button is clicked', () => {
    render(<Clients />);
    // Ensure the modal is not visible initially
    expect(screen.queryByTestId('mock-new-client-modal')).not.toBeInTheDocument();

    const newClientButton = screen.getByRole('button', { name: /Nuevo Cliente/i });
    fireEvent.click(newClientButton);

    // Check if our mocked modal is now rendered (which implies isOpen became true)
    expect(screen.getByTestId('mock-new-client-modal')).toBeInTheDocument();
  });

  it('should call refreshClients when "Actualizar" button is clicked', () => {
    const refreshClientsMock = vi.fn();
    vi.mocked(useClients).mockReturnValue({
      ...mockUseClientsReturnValue,
      refreshClients: refreshClientsMock,
    });
    render(<Clients />);
    // Assuming the refresh button has the text "Actualizar" or is identifiable by a role/icon.
    // For this example, let's assume it's a button with "Actualizar" text.
    // If it's an icon button, we might need to use getByRole with a more specific selector or add a test-id.
    const refreshButton = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(refreshButton);
    expect(refreshClientsMock).toHaveBeenCalledTimes(1);
  });

  // More tests will go here
}); 