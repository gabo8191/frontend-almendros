import React from 'react';
import { User, Edit2, UserX, UserCheck } from 'lucide-react';
import { Client } from '../../api/client/clientService';
import Button from '../../../../shared/components/Button';

interface ClientsTableProps {
  clients: Client[];
  isAdmin: boolean;
  processingClientId: number | null;
  currentPage: number;
  totalPages: number;
  toggleClientStatus: (client: Client) => void;
  handlePageChange: (page: number) => void;
  onEditClick: (client: Client) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isAdmin,
  processingClientId,
  currentPage,
  totalPages,
  toggleClientStatus,
  handlePageChange,
  onEditClick,
}) => {
  const ClientAvatar = () => (
    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
      <User size={20} className="text-primary-600" />
    </div>
  );

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );

  const ActionButtons = ({ client }: { client: Client }) => (
    <div className="flex justify-end space-x-2">
      <Button
        variant="ghost"
        size="sm"
        icon={<Edit2 size={16} />}
        onClick={() => onEditClick(client)}
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={client.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
        onClick={() => toggleClientStatus(client)}
        disabled={processingClientId === client.id}
      >
        {processingClientId === client.id 
          ? 'Procesando...' 
          : client.isActive ? 'Desactivar' : 'Activar'
        }
      </Button>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-8 space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        
        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
          if (pageNum > totalPages) return null;
          
          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? undefined : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="w-8 h-8 p-0"
            >
              {pageNum}
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ClientAvatar />
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
                  <StatusBadge isActive={client.isActive} />
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ActionButtons client={client} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <ClientAvatar />
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-500">{client.email}</div>
              </div>
              <StatusBadge isActive={client.isActive} />
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-900">{client.documentType}</div>
              <div className="text-sm text-gray-500">{client.documentNumber}</div>
            </div>

            {isAdmin && <ActionButtons client={client} />}
          </div>
        ))}
      </div>

      <Pagination />
    </>
  );
};

export default ClientsTable;
