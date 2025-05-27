import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { MovementType } from '../../api/inventoryService';
import { productService, Product } from '../../api/productService';
import { supplierService, Supplier } from '../../api/supplierService';
import { useToast } from '../../../../shared/context/ToastContext';
import { 
  InventoryMovementFormData,
  validateInventoryMovementForm,
  getReasonOptions,
  CreateInventoryMovementData
} from '../../schemas/inventory.schema';

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
  const [formData, setFormData] = useState<InventoryMovementFormData>({
    productId: '',
    supplierId: '',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setIsLoadingData(true);
        try {
          const [productsResponse, suppliersResponse] = await Promise.all([
            productService.getProducts(1, 100, { isActive: true }),
            supplierService.getSuppliers(1, 100, { isActive: true }),
          ]);
          setProducts(productsResponse.data);
          setSuppliers(suppliersResponse.data);
        } catch (error) {
          showToast('error', 'Error al cargar los datos');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Resetear formulario cuando cambia el tipo
  useEffect(() => {
    if (isOpen) {
      setFormData({
        productId: '',
        supplierId: '',
        quantity: '',
        reason: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen, type]);

  const handleInputChange = (field: keyof InventoryMovementFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar con Zod
    const validation = validateInventoryMovementForm(formData, type);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!validation.cleanData) {
      setErrors({ general: 'Error procesando los datos' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(validation.cleanData);
      showToast('success', 'Movimiento registrado exitosamente');
      onClose();
    } catch (error: any) {
      showToast('error', error.message || 'Error al registrar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = getReasonOptions(type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar ${type === 'ENTRY' ? 'Entrada' : 'Salida'} de Inventario`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error general */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

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

        <div className="flex justify-end space-x-3 mt-6">
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
