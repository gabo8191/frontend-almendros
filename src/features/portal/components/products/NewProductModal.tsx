import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useNewProductForm } from './Hooks/useNewProductForm';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: {
    name: string;
    description: string;
    minQuantity: number;
    maxQuantity: number;
    supplierId: number;
    purchasePrice: number;
    sellingPrice: number;
  }) => Promise<void>;
}

const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    formData,
    setFormData,
    suppliers,
    errors,
    isSubmitting,
    isLoadingSuppliers,
    handleNumberChange,
    handleSubmit,
  } = useNewProductForm(isOpen);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSave);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Producto" size="lg">
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <Input
            label="Nombre del Producto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
            placeholder="Ingresa el nombre del producto"
          />

          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            placeholder="Describe el producto"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              disabled={isLoadingSuppliers}
              required
            >
              <option value="">
                {isLoadingSuppliers ? 'Cargando proveedores...' : 'Selecciona un proveedor'}
              </option>
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad Mínima"
              type="number"
              min="0"
              value={formData.minQuantity}
              onChange={(e) => handleNumberChange('minQuantity', e.target.value)}
              error={errors.minQuantity}
              required
            />

            <Input
              label="Cantidad Máxima"
              type="number"
              min="0"
              value={formData.maxQuantity}
              onChange={(e) => handleNumberChange('maxQuantity', e.target.value)}
              error={errors.maxQuantity}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio de Compra (COP)"
              type="number"
              step="0.01"
              min="0"
              value={formData.purchasePrice}
              onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
              error={errors.purchasePrice}
              required
            />

            <Input
              label="Precio de Venta (COP)"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) => handleNumberChange('sellingPrice', e.target.value)}
              error={errors.sellingPrice}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Crear Producto
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewProductModal;
