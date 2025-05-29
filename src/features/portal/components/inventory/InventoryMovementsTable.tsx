import React from 'react';
import { Package, ArrowUp, ArrowDown } from 'lucide-react';
import { InventoryMovement, MovementType } from '../../api/inventory/inventoryService';
import Button from '../../../../shared/components/Button';
import Spinner from '../../../../shared/components/Spinner';
import Table from '../../../../shared/components/Table';

interface InventoryMovementsTableProps {
  movements: InventoryMovement[];
  isLoading: boolean;
  searchTerm: string;
  selectedMovementType: string;
  currentPage: number;
  totalPages: number;
  formatDate: (date: string) => string;
  onPageChange: (page: number) => void;
}

const InventoryMovementsTable: React.FC<InventoryMovementsTableProps> = ({
  movements,
  isLoading,
  searchTerm,
  selectedMovementType,
  currentPage,
  totalPages,
  formatDate,
  onPageChange,
}) => {
  const MovementTypeBadgeAndIcon = ({ type }: { type: MovementType }) => {
    const isEntry = type === 'ENTRY';
    return (
      <span
        className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
          isEntry
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {isEntry ? 
            <ArrowUp size={14} className="mr-1" /> : 
            <ArrowDown size={14} className="mr-1" />
        }
        {isEntry ? 'Entrada' : 'Salida'}
      </span>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-8">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron movimientos
      </h3>
      <p className="text-gray-600">
        {searchTerm || selectedMovementType
          ? 'No hay resultados para tu búsqueda'
          : 'Aún no hay movimientos registrados'}
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className="text-center py-12">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-gray-600">Cargando movimientos...</p>
    </div>
  );

  const columns = [
    {
      header: 'Fecha',
      renderCell: (movement: InventoryMovement) => formatDate(movement.movementDate),
    },
    {
      header: 'Tipo',
      renderCell: (movement: InventoryMovement) => <MovementTypeBadgeAndIcon type={movement.type} />,
    },
    {
      header: 'Producto',
      renderCell: (movement: InventoryMovement) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{movement.product.name}</div>
          <div className="text-sm text-gray-500">Stock actual: {movement.product.currentStock}</div>
        </div>
      ),
    },
    {
      header: 'Cantidad',
      renderCell: (movement: InventoryMovement) => `${movement.quantity} unidades`,
      cellClassName: 'text-sm text-gray-900',
    },
    {
      header: 'Razón',
      renderCell: (movement: InventoryMovement) => (
        <div>
          <div className="text-sm text-gray-900">{movement.reason}</div>
          {movement.notes && (
            <div className="text-sm text-gray-500">{movement.notes}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Usuario',
      renderCell: (movement: InventoryMovement) => (
        <div>
          <div className="text-sm text-gray-900">
            {movement.user.firstName} {movement.user.lastName}
          </div>
          <div className="text-sm text-gray-500">{movement.user.email}</div>
        </div>
      ),
    },
  ];

  const renderMobileCard = (movement: InventoryMovement) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-gray-900">{movement.product.name}</div>
            <MovementTypeBadgeAndIcon type={movement.type} />
        </div>
        <div className="text-xs text-gray-500 mb-2">{formatDate(movement.movementDate)}</div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
            <div><span className="text-gray-500">Cantidad:</span> {movement.quantity}</div>
            <div><span className="text-gray-500">Stock:</span> {movement.product.currentStock}</div>
        </div>
        <div className="text-sm mb-1"><span className="text-gray-500">Razón:</span> {movement.reason}</div>
        {movement.notes && <div className="text-xs text-gray-500 mb-2"><span className="font-medium">Notas:</span> {movement.notes}</div>}
        <div className="text-xs text-gray-500 border-t pt-1 mt-1">
            Registrado por: {movement.user.firstName} {movement.user.lastName}
        </div>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center mt-6 space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    );
  };

  if (isLoading) return <LoadingState />;
  if (movements.length === 0) return <EmptyState />;

  return (
    <>
      <Table 
        columns={columns} 
        data={movements} 
        rowKeyExtractor={(movement) => movement.id} 
        renderMobileCard={renderMobileCard}
      />
      <Pagination />
    </>
  );
};

export default InventoryMovementsTable;
