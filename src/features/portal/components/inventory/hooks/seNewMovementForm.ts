import { useState, useEffect } from 'react';
import { MovementType } from '../../../api/inventoryService';
import { productService, Product } from '../../../api/productService';
import { supplierService, Supplier } from '../../../api/supplierService';
import { useToast } from '../../../../../shared/context/ToastContext';
import { 
  InventoryMovementFormData,
  validateInventoryMovementForm,
  getReasonOptions
} from '../../../schemas/inventory.schema';

export const useNewMovementForm = (type: MovementType, isOpen: boolean) => {
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

  const resetForm = () => {
    setFormData({
      productId: '',
      supplierId: '',
      quantity: '',
      reason: '',
      notes: '',
    });
    setErrors({});
  };

  const fetchData = async () => {
    if (!isOpen) return;
    
    setIsLoadingData(true);
    try {
      const [productsResponse, suppliersResponse] = await Promise.all([
        productService.getProducts(1, 100, { isActive: true }),
        supplierService.getSuppliers(1, 100, { isActive: true }),
      ]);
      setProducts(productsResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch (error: any) {
      showToast('error', 'Error al cargar los datos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = () => {
    const validation = validateInventoryMovementForm(formData, type);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return null;
    }

    if (!validation.cleanData) {
      setErrors({ general: 'Error procesando los datos' });
      return null;
    }

    setErrors({});
    return validation.cleanData;
  };

  const handleInputChange = (field: keyof InventoryMovementFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSave: (data: any) => Promise<void>
  ) => {
    e.preventDefault();
    
    const cleanData = validateForm();
    if (!cleanData) return false;

    setIsSubmitting(true);
    try {
      await onSave(cleanData);
      resetForm();
      return true;
    } catch (error: any) {
      showToast('error', error.message || 'Error al registrar el movimiento');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchData();
    }
  }, [isOpen, type]);

  const reasonOptions = getReasonOptions(type);

  return {
    formData,
    products,
    suppliers,
    errors,
    isSubmitting,
    isLoadingData,
    reasonOptions,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
