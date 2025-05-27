import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { MovementType } from '../../api/inventory/inventoryService';
import { CreateInventoryMovementData } from '../../schemas/inventory.schema';
import { useNewMovementForm } from './hooks/seNewMovementForm';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MovementType;
  onSave: (movementData: CreateInventoryMovementData) => Promise<void>;
}

const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  type,
  onSave,
}) => {
  const {
    formData,
    products,
    suppliers,
    errors,
    isSubmitting,
    isLoadingData,
    reasonOptions,
    handleInputChange,
    handleSubmit,
  } = useNewMovementForm(type, isOpen);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSave);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar ${type === 'ENTRY' ? 'Entrada' : 'Salida'} de Inventario`}
    >
      <form onSubmit={onSubmit}>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto *
            </label>
            <select
              value={formData.productId}
              onChange={handleInputChange('productId')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              disabled={isLoadingData}
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.currentStock})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón del Movimiento *
            </label>
            <select
              value={formData.reason}
              onChange={handleInputChange('reason')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Selecciona una razón</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {type === 'ENTRY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <select
                value={formData.supplierId}
                onChange={handleInputChange('supplierId')}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled={isLoadingData}
              >
                <option value="">Selecciona un proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
              )}
            </div>
          )}

          <Input
            label="Cantidad"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange('quantity')}
            error={errors.quantity}
            required
            min="1"
            step="1"
            placeholder="Ingresa la cantidad"
          />

          <Input
            label="Notas (opcional)"
            value={formData.notes || ''}
            onChange={handleInputChange('notes')}
            placeholder="Información adicional sobre el movimiento"
            maxLength={500}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewMovementModal;
