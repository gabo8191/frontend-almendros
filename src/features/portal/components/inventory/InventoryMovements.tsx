import React, { useState, useEffect } from 'react';
import { Package, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { inventoryService, InventoryMovement, MovementType } from '../../api/inventoryService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewMovementModal from './NewMovementModal';

const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | ''>('');
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchMovements = async () => {
    try {
      const response = await inventoryService.getMovements(currentPage, 10, {
        type: selectedMovementType || undefined,
        reason: searchTerm || undefined,
      });
      setMovements(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      showToast('error', 'Error al cargar los movimientos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [currentPage, selectedMovementType, searchTerm]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
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
              onClick={() => {
                setSelectedMovementType('EXIT');
                setIsNewMovementModalOpen(true);
              }}
            >
              Registrar Salida
            </Button>
            <Button
              icon={<ArrowUpCircle size={16} />}
              onClick={() => {
                setSelectedMovementType('ENTRY');
                setIsNewMovementModalOpen(true);
              }}
            >
              Registrar Entrada
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar por razón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value as MovementType | '')}
            className="rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRY">Entradas</option>
            <option value="EXIT">Salidas</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando movimientos...</p>
          </div>
        ) : movements.length === 0 ? (
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
        ) : (
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          movement.type === 'ENTRY'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {movement.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock actual: {movement.product.currentStock}
                      </div>
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

      <NewMovementModal
        isOpen={isNewMovementModalOpen}
        onClose={() => setIsNewMovementModalOpen(false)}
        type={selectedMovementType as MovementType}
        onSave={async (movementData) => {
          try {
            await inventoryService.createMovement(movementData);
            showToast('success', 'Movimiento registrado exitosamente');
            fetchMovements();
          } catch (error) {
            showToast('error', 'Error al registrar el movimiento');
            throw error;
          }
        }}
      />
    </div>
  );
};

export default InventoryMovements;