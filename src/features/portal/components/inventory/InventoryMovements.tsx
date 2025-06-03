import React, { useState } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { MovementType } from '../../api/inventory/inventoryService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewMovementModal from './NewMovementModal';
import InventoryMovementsTable from './InventoryMovementsTable';
import { useInventoryMovements } from './hooks/useInventoryMovements';

const InventoryMovements: React.FC = () => {
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [modalMovementType, setModalMovementType] = useState<MovementType>('ENTRY');
  
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const movementsData = useInventoryMovements();

  const openModal = (type: MovementType) => {
    setModalMovementType(type);
    setIsNewMovementModalOpen(true);
  };

  const handleSaveMovement = async (movementData: any) => {
    const success = await movementsData.createMovement(movementData);
    if (success) {
      setIsNewMovementModalOpen(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-gray-600 mt-1">Gestiona los movimientos de entrada y salida</p>
        </div>
        {isAdmin && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              variant="outline"
              icon={<ArrowDownCircle size={16} />}
              onClick={() => openModal('EXIT')}
            >
              Registrar Salida
            </Button>
            <Button
              icon={<ArrowUpCircle size={16} />}
              onClick={() => openModal('ENTRY')}
            >
              Registrar Entrada
            </Button>
          </div>
        )}
      </div>

      <Card compact>
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar por razón..."
            value={movementsData.searchTerm}
            onChange={(e) => movementsData.setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={movementsData.selectedMovementType}
            onChange={(e) => movementsData.setSelectedMovementType(e.target.value as MovementType | '')}
            className="rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRY">Entradas</option>
            <option value="EXIT">Salidas</option>
          </select>
        </div>

        {/* Table */}
        <InventoryMovementsTable
          movements={movementsData.movements}
          isLoading={movementsData.isLoading}
          searchTerm={movementsData.searchTerm}
          selectedMovementType={movementsData.selectedMovementType}
          currentPage={movementsData.currentPage}
          totalPages={movementsData.totalPages}
          formatDate={movementsData.formatDate}
          onPageChange={movementsData.handlePageChange}
        />
      </Card>

      <NewMovementModal
        isOpen={isNewMovementModalOpen}
        onClose={() => setIsNewMovementModalOpen(false)}
        type={modalMovementType}
        onSave={handleSaveMovement}
      />
    </div>
  );
};

export default InventoryMovements;
