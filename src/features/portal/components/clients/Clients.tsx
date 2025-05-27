import React, { useState } from 'react';
import { User, Search, Plus, RefreshCw } from 'lucide-react';
import { Client } from '../../api/clientService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import EditClientModal from './EditClientModal';
import NewClientModal from './NewClient';
import ClientsTable from './ClientsTable';
import { useClients } from './hooks/useClients';

const Clients: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const clientsData = useClients();

  const handleEditClick = (client: Client) => {
    if (!clientsData.isAdmin) return;
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: any) => {
    if (!selectedClient) return;
    const success = await clientsData.updateClient(selectedClient.id, data);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedClient(null);
    }
  };

  const handleSaveNew = async (data: any) => {
    const success = await clientsData.createClient(data);
    if (success) {
      setIsNewClientModalOpen(false);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <User size={64} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {clientsData.searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
      </h3>
      <p className="text-gray-600 mb-6">
        {clientsData.searchTerm 
          ? 'Intenta ajustar los términos de búsqueda'
          : 'Comienza agregando tu primer cliente'
        }
      </p>
      {!clientsData.searchTerm && (
        <Button
          icon={<Plus size={16} />}
          onClick={() => setIsNewClientModalOpen(true)}
        >
          Crear Primer Cliente
        </Button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando clientes...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra la información de los clientes</p>
          {clientsData.totalClients > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Total de clientes: {clientsData.totalClients}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={clientsData.refreshClients}
            disabled={clientsData.isLoading}
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
            value={clientsData.searchTerm}
            onChange={(e) => clientsData.setSearchTerm(e.target.value)}
          />
        </div>

        {clientsData.isLoading ? renderLoadingState() : 
         clientsData.clients.length === 0 ? renderEmptyState() : 
         <ClientsTable {...clientsData} onEditClick={handleEditClick} />}
      </Card>

      {selectedClient && clientsData.isAdmin && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {setIsEditModalOpen(false); setSelectedClient(null);}}
          client={selectedClient}
          onSave={handleSaveEdit as any}
        />
      )}

      {isNewClientModalOpen && (
        <NewClientModal
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onSave={handleSaveNew as any}
        />
      )}
    </div>
  );
};

export default Clients;
