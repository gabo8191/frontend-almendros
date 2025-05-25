import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../api/productService';
import { supplierService, Supplier } from '../../api/supplierService';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Modal from '../../../../shared/components/Modal';

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minQuantity: '',
    maxQuantity: '',
    supplierId: '',
    purchasePrice: '',
    sellingPrice: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const response = await supplierService.getSuppliers(1, 100, { isActive: true });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        minQuantity: product.minQuantity?.toString() || '',
        maxQuantity: product.maxQuantity?.toString() || '',
        supplierId: product.supplierId?.toString() || '',
        purchasePrice: product.purchasePrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || '',
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.minQuantity || isNaN(Number(formData.minQuantity)) || Number(formData.minQuantity) < 0) {
      newErrors.minQuantity = 'La cantidad mínima debe ser un número válido mayor o igual a 0';
    }

    if (!formData.maxQuantity || isNaN(Number(formData.maxQuantity)) || Number(formData.maxQuantity) < 0) {
      newErrors.maxQuantity = 'La cantidad máxima debe ser un número válido mayor o igual a 0';
    }

    if (Number(formData.minQuantity) > Number(formData.maxQuantity)) {
      newErrors.maxQuantity = 'La cantidad máxima debe ser mayor que la mínima';
    }

    if (!formData.supplierId || isNaN(Number(formData.supplierId)) || Number(formData.supplierId) <= 0) {
      newErrors.supplierId = 'Debe seleccionar un proveedor válido';
    }

    if (!formData.purchasePrice || isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'El precio de compra debe ser un número válido mayor a 0';
    }

    if (!formData.sellingPrice || isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'El precio de venta debe ser un número válido mayor a 0';
    }

    if (Number(formData.purchasePrice) >= Number(formData.sellingPrice)) {
      newErrors.sellingPrice = 'El precio de venta debe ser mayor que el precio de compra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const productData: Partial<Product> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        minQuantity: Number(formData.minQuantity),
        maxQuantity: Number(formData.maxQuantity),
        supplierId: Number(formData.supplierId),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
      };

      const success = await onSave(productData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Editar Producto</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nombre del Producto"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              required
            />
          </div>

          <div>
            <Input
              label="Cantidad Mínima"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => handleInputChange('minQuantity', e.target.value)}
              error={errors.minQuantity}
              min="0"
              required
            />
          </div>

          <div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor *
            </label>
            {isLoadingSuppliers ? (
              <div className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                Cargando proveedores...
              </div>
            ) : (
              <select
                value={formData.supplierId}
                onChange={(e) => handleInputChange('supplierId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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

          <div>
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
          </div>

          <div className="md:col-span-2">
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

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;