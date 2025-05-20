import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Sale } from '../../api/saleService';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Venta"
    >
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Venta #{sale.id}
            </h3>
            <p className="text-gray-600">{formatDate(sale.saleDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cliente</p>
            <p className="font-medium text-gray-900">{sale.client?.name}</p>
            <p className="text-sm text-gray-600">{sale.client?.documentNumber}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Productos</h4>
          <div className="space-y-3">
            {sale.details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{detail.product?.name}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {detail.quantity} x {formatCurrency(detail.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(detail.quantity * detail.unitPrice - detail.discountAmount)}
                  </p>
                  {detail.discountAmount > 0 && (
                    <p className="text-sm text-green-600">
                      Descuento: {formatCurrency(detail.discountAmount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <p>Total</p>
            <p>{formatCurrency(sale.totalAmount)}</p>
          </div>
        </div>

        {sale.notes && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
            <p className="text-gray-600">{sale.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;