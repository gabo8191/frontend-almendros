import { useState, useEffect } from 'react';
import { inventoryService, InventoryMovement, MovementType } from '../../../api/inventory/inventoryService';
import { useToast } from '../../../../../shared/context/ToastContext';


export const useInventoryMovements = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | ''>('');
  
  const { showToast } = useToast();

  const fetchMovements = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await inventoryService.getMovements(page, 10, {
        type: selectedMovementType || undefined,
        reason: searchTerm || undefined,
      });
      setMovements(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      showToast('error', 'Error al cargar los movimientos');
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createMovement = async (movementData: any) => {
    try {
      await inventoryService.createMovement(movementData);
      showToast('success', 'Movimiento registrado exitosamente');
      fetchMovements();
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al registrar el movimiento');
      return false;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const refreshMovements = () => {
    fetchMovements(currentPage);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchMovements();
  }, [currentPage, selectedMovementType, searchTerm]);

  return {
    movements,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    selectedMovementType,
    setSelectedMovementType,
    createMovement,
    handlePageChange,
    refreshMovements,
    formatDate,
  };
};
