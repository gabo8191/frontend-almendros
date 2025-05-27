import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Client } from '../../api/client/clientService';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import NewClientModal from '../clients/NewClient';

interface ClientSelectionSectionProps {
  selectedClient: Client | undefined;
  clientSearchTerm: string;
  setClientSearchTerm: (term: string) => void;
  filteredClients: Client[];
  errors: Record<string, string>;
  onClientSelection: (clientId: number) => void;
  onClientClear: () => void;
  onNewClientSave: (clientData: any) => Promise<boolean>;
}

const ClientSelectionSection: React.FC<ClientSelectionSectionProps> = ({
  selectedClient,
  clientSearchTerm,
  setClientSearchTerm,
  filteredClients,
  errors,
  onClientSelection,
  onClientClear,
  onNewClientSave,
}) => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const handleNewClientSave = async (clientData: any) => {
    const success = await onNewClientSave(clientData);
    if (success) {
      setIsNewClientModalOpen(false);
    }
    return success;
  };

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cliente *</label>
        {selectedClient ? (
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border">
            <div>
              <div className="font-medium text-primary-900">{selectedClient.name}</div>
              <div className="text-sm text-primary-600">
                {selectedClient.documentType}: {selectedClient.documentNumber}
              </div>
              {selectedClient.email && (
                <div className="text-sm text-primary-600">{selectedClient.email}</div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClientClear}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar cliente por nombre o documento..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                icon={<Search size={18} />}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewClientModalOpen(true)}
              >
                Nuevo Cliente
              </Button>
            </div>
            {clientSearchTerm && (
              <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => onClientSelection(client.id)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">
                        {client.documentType}: {client.documentNumber}
                      </div>
                      {client.email && (
                        <div className="text-sm text-gray-500">{client.email}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No se encontraron clientes
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {errors.clientId && (
          <p className="text-sm text-red-600">{errors.clientId}</p>
        )}
      </div>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleNewClientSave}
      />
    </>
  );
};

export default ClientSelectionSection;
