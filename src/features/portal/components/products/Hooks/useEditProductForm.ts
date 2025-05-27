import { useState, useEffect } from 'react';
import { Product } from '../../../api/product/types';
import { supplierService, Supplier } from '../../../api/supplier/supplierService';

export const useEditProductForm = (product: Product | null, isOpen: boolean) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minQuantity: '',
    maxQuantity: '',
    supplierId: '',
    purchasePrice: '',
    sellingPrice: '',
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const response = await supplierService.getSuppliers(1, 100, { isActive: true });
      setSuppliers(response.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSave: (data: any) => Promise<boolean>
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        minQuantity: Number(formData.minQuantity),
        maxQuantity: Number(formData.maxQuantity),
        supplierId: Number(formData.supplierId),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
      };

      const success = await onSave(productData);
      return success;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
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

  return {
    formData,
    suppliers,
    errors,
    isSubmitting,
    isLoadingSuppliers,
    handleInputChange,
    handleSubmit,
  };
};
