import React from 'react';
import { Package } from 'lucide-react';
import { InventoryMovement } from '../../api/inventory/inventoryService';
import Button from '../../../../shared/components/Button';

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
  const MovementTypeBadge = ({ type }: { type: string }) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        type === 'ENTRY'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {type === 'ENTRY' ? 'Entrada' : 'Salida'}
    </span>
  );

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
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando movimientos...</p>
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(movement.movementDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <MovementTypeBadge type={movement.type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{movement.product.name}</div>
                  <div className="text-sm text-gray-500">Stock actual: {movement.product.currentStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.quantity} unidades
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{movement.reason}</div>
                  {movement.notes && (
                    <div className="text-sm text-gray-500">{movement.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {movement.user.firstName} {movement.user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{movement.user.email}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </>
  );
};

export default InventoryMovementsTable;
