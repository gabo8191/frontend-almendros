import React, { useState, useEffect } from 'react';
import { User, Edit2, UserX, UserCheck, Search, Plus, RefreshCw } from 'lucide-react';
import { clientService, Client } from '../../api/clientService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import EditClientModal from './EditClientModal';
import NewClientModal from './NewClient';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [processingClientId, setProcessingClientId] = useState<number | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  // Debug logging for user role
  useEffect(() => {
    console.log('=== USER ROLE DEBUG ===');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Role.ADMINISTRATOR:', Role.ADMINISTRATOR);
    console.log('Is admin:', isAdmin);
    console.log('=== END USER DEBUG ===');
  }, [user, isAdmin]);

  const fetchClients = async (page: number) => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      
      const response = await clientService.getClients(page, 10, filters);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalClients(response.meta.total);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      showToast('error', `Error al cargar los clientes: ${error.response?.data?.message || error.message}`);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchClients(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage]);

  const handleEditClick = (client: Client) => {
    if (!isAdmin) {
      showToast('error', 'No tienes permisos para editar clientes');
      return;
    }
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (client: Client) => {
    console.log('=== TOGGLE STATUS DEBUG ===');
    console.log('Client to toggle:', client);
    console.log('Current isActive:', client.isActive);
    console.log('Target isActive:', !client.isActive);
    console.log('User is admin:', isAdmin);
    console.log('User object:', user);
    console.log('=== END TOGGLE DEBUG ===');

    if (!isAdmin) {
      showToast('error', 'No tienes permisos para cambiar el estado de los clientes');
      return;
    }

    try {
      setProcessingClientId(client.id);
      
      await clientService.toggleClientStatus(client.id, !client.isActive);
      
      showToast('success', `Cliente ${client.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchClients(currentPage);
    } catch (error: any) {
      console.error('=== TOGGLE STATUS ERROR ===');
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error config:', error.config);
      console.error('=== END TOGGLE ERROR ===');

      let errorMessage = 'Error al cambiar el estado del cliente';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción. Contacta al administrador.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast('error', errorMessage);
    } finally {
      setProcessingClientId(null);
    }
  };

  const handleRefresh = () => {
    fetchClients(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleClientCreated = () => {
    setIsNewClientModalOpen(false);
    setCurrentPage(1);
    fetchClients(1);
    showToast('success', 'Cliente creado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra la información de los clientes</p>
          {totalClients > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Total de clientes: {totalClients}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Actualizar
          </Button>
          <Button 
            icon={<Plus size={16} />}
            onClick={() => setIsNewClientModalOpen(true)}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta ajustar los términos de búsqueda'
                : 'Comienza agregando tu primer cliente'
              }
            </p>
            {!searchTerm && (
              <Button
                icon={<Plus size={16} />}
                onClick={() => setIsNewClientModalOpen(true)}
              >
                Crear Primer Cliente
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User size={20} className="text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.documentType}</div>
                        <div className="text-sm text-gray-500">{client.documentNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {client.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 size={16} />}
                              onClick={() => handleEditClick(client)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={client.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                              onClick={() => handleToggleStatus(client)}
                              disabled={processingClientId === client.id}
                            >
                              {processingClientId === client.id 
                                ? 'Procesando...' 
                                : client.isActive ? 'Desactivar' : 'Activar'
                              }
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={20} className="text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-900">{client.documentType}</div>
                    <div className="text-sm text-gray-500">{client.documentNumber}</div>
                  </div>

                  {isAdmin && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        onClick={() => handleEditClick(client)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={client.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        onClick={() => handleToggleStatus(client)}
                        disabled={processingClientId === client.id}
                      >
                        {processingClientId === client.id 
                          ? 'Procesando...' 
                          : client.isActive ? 'Desactivar' : 'Activar'
                        }
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {selectedClient && isAdmin && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          onSave={async (updatedData) => {
            try {
              await clientService.updateClient(selectedClient.id, updatedData);
              showToast('success', 'Cliente actualizado exitosamente');
              fetchClients(currentPage);
              setIsEditModalOpen(false);
              setSelectedClient(null);
              return true;
            } catch (error: any) {
              showToast('error', `Error al actualizar el cliente: ${error.response?.data?.message || error.message}`);
              return false;
            }
          }}
        />
      )}

      {isNewClientModalOpen && (
        <NewClientModal
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onSave={async (clientData) => {
            try {
              await clientService.createClient(clientData);
              handleClientCreated();
              return true;
            } catch (error: any) {
              showToast('error', `Error al crear el cliente: ${error.response?.data?.message || error.message}`);
              return false;
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
