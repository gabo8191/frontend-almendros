import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { supplierService } from '../../api/supplierService';
import { productService } from '../../api/productService';
import { useToast } from '../../../../shared/context/ToastContext';

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minQuantity: 0,
    maxQuantity: 0,
    supplierId: '',
    purchasePrice: 0,
    sellingPrice: 0,
  });
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (isOpen) {
        setIsLoadingSuppliers(true);
        try {
          const response = await supplierService.getSuppliers(1, 100, { isActive: true });
          setSuppliers(response.data.map(s => ({ id: s.id, name: s.name })));
        } catch (error) {
          showToast('error', 'Error al cargar los proveedores');
        } finally {
          setIsLoadingSuppliers(false);
        }
      }
    };

    fetchSuppliers();
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validations
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'El proveedor es requerido';
    }

    // Validate quantities
    const minQuantity = Number(formData.minQuantity);
    const maxQuantity = Number(formData.maxQuantity);
    
    if (isNaN(minQuantity) || minQuantity < 0) {
      newErrors.minQuantity = 'La cantidad mínima debe ser mayor o igual a 0';
    }

    if (isNaN(maxQuantity) || maxQuantity <= minQuantity) {
      newErrors.maxQuantity = 'La cantidad máxima debe ser mayor que la mínima';
    }

    // Validate prices - ensure they are valid numbers and meet business rules
    const purchasePrice = Number(formData.purchasePrice);
    const sellingPrice = Number(formData.sellingPrice);
    
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchasePrice = 'El precio de compra debe ser mayor a 0';
    }

    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      newErrors.sellingPrice = 'El precio de venta debe ser mayor a 0';
    } else if (sellingPrice <= purchasePrice) {
      newErrors.sellingPrice = 'El precio de venta debe ser mayor al precio de compra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberChange = (field: string, value: string) => {
    let numValue = 0;
    
    // Handle empty inputs
    if (value === '') {
      numValue = 0;
    } else {
      // Parse as float for price fields
      if (field === 'purchasePrice' || field === 'sellingPrice') {
        numValue = parseFloat(value) || 0;
      } else {
        // Parse as int for quantity fields
        numValue = parseInt(value) || 0;
      }
    }
    
    setFormData({
      ...formData,
      [field]: numValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a payload with properly parsed numeric values
      const payload = {
        name: formData.name,
        description: formData.description,
        minQuantity: Number(formData.minQuantity),
        maxQuantity: Number(formData.maxQuantity),
        supplierId: parseInt(formData.supplierId),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice)
      };

      // Verify all numeric fields are valid numbers
      if (
        isNaN(payload.minQuantity) ||
        isNaN(payload.maxQuantity) ||
        isNaN(payload.supplierId) ||
        isNaN(payload.purchasePrice) ||
        isNaN(payload.sellingPrice)
      ) {
        showToast('error', 'Valores numéricos inválidos');
        return;
      }

      await onSave(payload);
      onClose();
      setFormData({
        name: '',
        description: '',
        minQuantity: 0,
        maxQuantity: 0,
        supplierId: '',
        purchasePrice: 0,
        sellingPrice: 0,
      });
    } catch (error) {
      console.error('Error in form submission:', error);
      showToast('error', error.message || 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Producto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Producto"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor
          </label>
          <select
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isLoadingSuppliers}
            required
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
            label="Precio de Compra"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
            error={errors.purchasePrice}
            required
          />

          <Input
            label="Precio de Venta"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice}
            onChange={(e) => handleNumberChange('sellingPrice', e.target.value)}
            error={errors.sellingPrice}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
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