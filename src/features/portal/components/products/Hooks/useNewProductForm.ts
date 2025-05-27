import { useState, useEffect } from 'react';
import { supplierService } from '../../../api/supplier/supplierService';
import { useToast } from '../../../../../shared/context/ToastContext';

export const useNewProductForm = (isOpen: boolean) => {
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minQuantity: 0,
      maxQuantity: 0,
      supplierId: '',
      purchasePrice: 0,
      sellingPrice: 0,
    });
    setErrors({});
  };

  const fetchSuppliers = async () => {
    if (!isOpen) return;
    
    setIsLoadingSuppliers(true);
    try {
      const response = await supplierService.getSuppliers(1, 100, { isActive: true });
      setSuppliers(response.data.map(s => ({ id: s.id, name: s.name })));
    } catch (error) {
      showToast('error', 'Error al cargar los proveedores');
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'El proveedor es requerido';
    }

    const minQuantity = Number(formData.minQuantity);
    const maxQuantity = Number(formData.maxQuantity);
    
    if (isNaN(minQuantity) || minQuantity < 0) {
      newErrors.minQuantity = 'La cantidad mínima debe ser mayor o igual a 0';
    }

    if (isNaN(maxQuantity) || maxQuantity <= minQuantity) {
      newErrors.maxQuantity = 'La cantidad máxima debe ser mayor que la mínima';
    }

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
    
    if (value === '') {
      numValue = 0;
    } else {
      if (field === 'purchasePrice' || field === 'sellingPrice') {
        numValue = parseFloat(value) || 0;
      } else {
        numValue = parseInt(value) || 0;
      }
    }
    
    setFormData({ ...formData, [field]: numValue });
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSave: (data: any) => Promise<void>
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        minQuantity: Number(formData.minQuantity),
        maxQuantity: Number(formData.maxQuantity),
        supplierId: parseInt(formData.supplierId),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice)
      };

      if (
        isNaN(payload.minQuantity) ||
        isNaN(payload.maxQuantity) ||
        isNaN(payload.supplierId) ||
        isNaN(payload.purchasePrice) ||
        isNaN(payload.sellingPrice)
      ) {
        showToast('error', 'Valores numéricos inválidos');
        return false;
      }

      await onSave(payload);
      resetForm();
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear el producto');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [isOpen]);

  return {
    formData,
    setFormData,
    suppliers,
    errors,
    isSubmitting,
    isLoadingSuppliers,
    handleNumberChange,
    handleSubmit,
    resetForm,
  };
};
