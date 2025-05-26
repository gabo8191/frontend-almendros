import React, { useState, useEffect } from 'react';
import { User, Edit2, UserX, UserCheck, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../../api/clientService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import EditClientModal from './EditClientModal';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients(currentPage);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      showToast('error', 'Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
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
      // This will now use the updated service logic with proper endpoints
      await clientService.toggleClientStatus(client.id, !client.isActive);
      showToast('success', `Cliente ${client.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchClients(); // Refresh the list
    } catch (error) {
      showToast('error', 'Error al cambiar el estado del cliente');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documentNumber.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra la información de los clientes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            icon={<Plus size={16} />}
            onClick={() => navigate('/portal/clients/new')}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No hay resultados para tu búsqueda'
                : 'Aún no hay clientes registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id}>
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
                        <div className="flex space-x-2">
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
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
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
              fetchClients();
              setIsEditModalOpen(false);
              setSelectedClient(null);
            } catch (error) {
              showToast('error', 'Error al actualizar el cliente');
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
