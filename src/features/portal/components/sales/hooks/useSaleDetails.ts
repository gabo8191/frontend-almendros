import { useState } from 'react';
import { saleService, Sale } from '../../../api/sale/saleService';
import { useToast } from '../../../../../shared/context/ToastContext';

export const useSaleDetails = () => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { showToast } = useToast();

  const handleViewDetails = async (saleId: number) => {
    setIsFetchingDetails(true);
    setIsDetailsModalOpen(true);
    
    try {
      const sale = await saleService.getSaleById(saleId);
      
      if (!sale.details || sale.details.length === 0) {
        const details = await saleService.getSaleDetails(saleId);
        sale.details = details;
      }
      
      setSelectedSale(sale);
    } catch (error: any) {
      showToast('error', 'Error al cargar los detalles de la venta');
      setSelectedSale(null);
      setIsDetailsModalOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setSelectedSale(null);
    setIsDetailsModalOpen(false);
    setIsFetchingDetails(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  return {
    selectedSale,
    isFetchingDetails,
    isDetailsModalOpen,
    handleViewDetails,
    handleCloseDetailsModal,
    formatDate,
    formatCurrency,
  };
};
