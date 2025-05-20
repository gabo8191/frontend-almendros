import React, { useState, useEffect } from 'react';
import { productService, PriceHistory, Product } from '../../api/productService';
import { Modal } from '../../../../shared/components/Modal';
import { useToast } from '../../../../shared/context/ToastContext';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (isOpen && product) {
        setIsLoading(true);
        try {
          const history = await productService.getPriceHistory(product.id);
          setPriceHistory(history);
        } catch (error) {
          showToast('error', 'Error al cargar el historial de precios');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPriceHistory();
  }, [isOpen, product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de Precios - ${product.name}`}
    >
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      ) : priceHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay cambios de precio registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {priceHistory.map((record, index) => (
            <div
              key={record.id}
              className="p-4 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {record.type === 'SELLING' ? 'Precio de Venta' : 'Precio de Compra'}
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    {formatDate(record.changedAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {formatPrice(record.oldPrice)} →{' '}
                    <span className="font-medium text-gray-900">
                      {formatPrice(record.newPrice)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((record.newPrice - record.oldPrice) / record.oldPrice * 100).toFixed(1)}% de cambio
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default PriceHistoryModal;