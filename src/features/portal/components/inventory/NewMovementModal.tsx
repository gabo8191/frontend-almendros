import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { MovementType } from '../../api/inventoryService';
import { productService, Product } from '../../api/productService';
import { supplierService, Supplier } from '../../api/supplierService';
import { useToast } from '../../../../shared/context/ToastContext';

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MovementType;
  onSave: (movementData: {
    type: MovementType;
    quantity: number;
    productId: number;
    supplierId?: number;
    reason: string;
    notes?: string;
  }) => Promise<void>;
}

const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  type,
  onSave,
}) => {
  const [formData, setFormData] = useState({
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

  // Opciones de razones según el tipo de movimiento
  const getReasonOptions = () => {
    if (type === 'ENTRY') {
      return [
        { value: 'PURCHASE', label: 'Compra' },
        { value: 'RETURN', label: 'Devolución de Cliente' },
        { value: 'ADJUSTMENT', label: 'Ajuste de Inventario' },
        { value: 'INITIAL_STOCK', label: 'Stock Inicial' },
      ];
    } else {
      return [
        { value: 'SALE', label: 'Venta' },
        { value: 'DAMAGE', label: 'Producto Dañado' },
        { value: 'ADJUSTMENT', label: 'Ajuste de Inventario' },
        { value: 'RETURN', label: 'Devolución a Proveedor' },
      ];
    }
  };

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = 'Selecciona un producto';
    }

    if (type === 'ENTRY' && !formData.supplierId) {
      newErrors.supplierId = 'Selecciona un proveedor';
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.reason) {
      newErrors.reason = 'Selecciona una razón';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        supplierId: type === 'ENTRY' ? parseInt(formData.supplierId) : undefined,
        reason: formData.reason,
        notes: formData.notes || undefined,
      });
      onClose();
      setFormData({
        productId: '',
        supplierId: '',
        quantity: '',
        reason: '',
        notes: '',
      });
    } catch (error) {
      showToast('error', error.message || 'Error al registrar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = getReasonOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar ${type === 'ENTRY' ? 'Entrada' : 'Salida'} de Inventario`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producto *
          </label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          error={errors.quantity}
          required
          min="1"
          step="1"
        />

        <Input
          label="Notas (opcional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Información adicional sobre el movimiento"
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
