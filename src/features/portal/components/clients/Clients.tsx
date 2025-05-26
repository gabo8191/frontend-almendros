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
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchClients = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const response = await clientService.getClients(page, 10);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalClients(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (error) {
      showToast('error', 'Error al cargar los clientes');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      fetchClients(currentPage);
    }
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
    if (!isAdmin) {
      showToast('error', 'No tienes permisos para cambiar el estado de los clientes');
      return;
    }
    try {
      await clientService.toggleClientStatus(client.id, !client.isActive);
      showToast('success', `Cliente ${client.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchClients(currentPage);
    } catch (error) {
      showToast('error', 'Error al cambiar el estado del cliente');
    }
  };

  const handleRefresh = () => {
    fetchClients(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleClientCreated = () => {
    setIsNewClientModalOpen(false);
    fetchClients(1); // Refresh and go to first page
    setCurrentPage(1);
    showToast('success', 'Cliente creado exitosamente');
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documentNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
        {/* Search */}
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
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
            {/* Desktop Table */}
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
                  {filteredClients.map((client) => (
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
                            >
                              {client.isActive ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredClients.map((client) => (
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
                      >
                        {client.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
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

      {/* Edit Client Modal */}
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
            } catch (error) {
              showToast('error', 'Error al actualizar el cliente');
            }
          }}
        />
      )}

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <NewClientModal
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onSave={async (clientData) => {
            try {
              const newClient = await clientService.createClient(clientData);
              // Add the new client to the current list if we're on the first page
              if (currentPage === 1) {
                setClients(prevClients => [newClient, ...prevClients]);
              }
              handleClientCreated();
              return true;
            } catch (error) {
              showToast('error', 'Error al crear el cliente');
              return false;
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
