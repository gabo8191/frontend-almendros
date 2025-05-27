import React from 'react';
import { Product } from '../../api/product/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Modal from '../../../../shared/components/Modal';
import { useEditProductForm } from './Hooks/useEditProductForm';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (productData: Partial<Product>) => Promise<boolean>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const {
    formData,
    suppliers,
    errors,
    isSubmitting,
    isLoadingSuppliers,
    handleInputChange,
    handleSubmit,
  } = useEditProductForm(product, isOpen);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSave);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto" size="lg">
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <Input
            label="Nombre del Producto"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad Mínima"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => handleInputChange('minQuantity', e.target.value)}
              error={errors.minQuantity}
              min="0"
              required
            />

            <Input
              label="Cantidad Máxima"
              type="number"
              value={formData.maxQuantity}
              onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
              error={errors.maxQuantity}
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            {isLoadingSuppliers ? (
              <div className="border border-gray-300 rounded-xl px-3 py-2 text-gray-500">
                Cargando proveedores...
              </div>
            ) : (
              <select
                value={formData.supplierId}
                onChange={(e) => handleInputChange('supplierId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.supplierId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} - {supplier.contactName}
                  </option>
                ))}
              </select>
            )}
            {errors.supplierId && (
              <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio de Compra (COP)"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              error={errors.purchasePrice}
              min="0.01"
              required
            />

            <Input
              label="Precio de Venta (COP)"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
              error={errors.sellingPrice}
              min="0.01"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Actualizar Producto
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
