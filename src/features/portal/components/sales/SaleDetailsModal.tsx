import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Sale } from '../../api/sale/saleService';
import { AlertCircle } from 'lucide-react';
import Spinner from '../../../../shared/components/Spinner';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  isLoading?: boolean;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  sale, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  // Show loading state with spinner
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles de Venta">
        <div className="p-8 flex flex-col items-center justify-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600 text-lg">Cargando detalles de la venta...</p>
        </div>
      </Modal>
    );
  }

  if (!sale) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles de Venta">
        <div className="p-4 text-center text-gray-500">No se pudieron cargar los detalles de la venta.</div>
      </Modal>
    );
  }

  if (!sale.details || sale.details.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de Venta - ID: ${sale.id}`}>
        <div className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">No se encontraron detalles para esta venta.</p>
          <p className="text-sm text-gray-500 mt-1">
            Es posible que la venta no tenga productos asociados o hubo un problema al cargar los detalles.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de Venta - ID: ${sale.id}`}>
      <div className="p-4 space-y-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">ID Venta</p>
            <p className="text-lg font-semibold text-gray-800">{sale.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha</p>
            <p className="text-lg font-semibold text-gray-800">{formatDate(sale.saleDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cliente</p>
            <p className="text-lg font-semibold text-gray-800">{sale.client?.name || 'N/A'}</p>
            {sale.client?.documentNumber && (
              <p className="text-xs text-gray-500">Doc: {sale.client.documentNumber}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Monto Total</p>
            <p className="text-lg font-semibold text-primary-600">{formatCurrency(sale.totalAmount)}</p>
          </div>
        </div>

        {sale.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Notas Adicionales</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{sale.notes}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Productos Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.details.map((detail) => {
                  const subtotal = detail.quantity * detail.unitPrice - detail.discountAmount;
                  return (
                    <tr key={detail.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {detail.product?.name || 'Producto no disponible'}
                        {detail.product?.description && (
                          <p className="text-xs text-gray-500">{detail.product.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{detail.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(detail.unitPrice)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatCurrency(detail.discountAmount)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{formatCurrency(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;