import { useState, useEffect } from 'react';
import { productService } from '../../../api/product';
import { clientService, Client } from '../../../api/client/clientService';
import { saleService } from '../../../api/sale/saleService';
import { useToast } from '../../../../../shared/context/ToastContext';

interface Product {
  id: number;
  name: string;
  description: string;
  currentStock: number;
  isActive: boolean;
  prices?: Array<{
    id: number;
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
  }>;
  purchasePrice?: number;
  sellingPrice?: number;
}

interface SaleDetail {
  productId: number;
  productName?: string;
  currentStock?: number;
  sellingPrice?: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export const useNewSaleForm = (isOpen: boolean) => {
  const [formData, setFormData] = useState({
    clientId: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
    details: [] as SaleDetail[],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchIndices, setProductSearchIndices] = useState<Record<number, string>>({});

  const { showToast } = useToast();

  // ✅ CORREGIDO: Garantizar que siempre retorne numbers
  const getCurrentPrices = (product: Product) => {
    if (product.prices && Array.isArray(product.prices) && product.prices.length > 0) {
      const currentPrice = product.prices.find(p => p.isCurrentPrice) || product.prices[0];
      return {
        selling: currentPrice.sellingPrice || 0,  // ✅ Garantizar number
        purchase: currentPrice.purchasePrice || 0  // ✅ Garantizar number
      };
    }
    return {
      selling: product.sellingPrice || 0,  // ✅ Garantizar number
      purchase: product.purchasePrice || 0  // ✅ Garantizar number
    };
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  const fetchData = async () => {
    if (!isOpen) return;
    
    setIsLoadingData(true);
    try {
      const [productsResponse, clientsResponse] = await Promise.all([
        productService.getProducts(1, 100, { isActive: true }),
        clientService.getClients(1, 100),
      ]);
      setProducts(productsResponse.data);
      setClients(clientsResponse.data);
    } catch (error) {
      showToast('error', 'Error al cargar los datos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      saleDate: new Date().toISOString().split('T')[0],
      notes: '',
      details: [],
    });
    setProductSearchIndices({});
    setErrors({});
    setClientSearchTerm('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Selecciona un cliente';
    }

    if (!formData.saleDate) {
      newErrors.saleDate = 'Selecciona una fecha';
    } else {
      const selectedDate = new Date(formData.saleDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.saleDate = 'No puedes seleccionar una fecha futura';
      }
    }

    if (formData.details.length === 0) {
      newErrors.details = 'Agrega al menos un producto';
    }

    formData.details.forEach((detail, index) => {
      if (!detail.productId || detail.productId === 0) {
        newErrors[`product_${index}`] = 'Selecciona un producto';
      }
      if (!detail.quantity || detail.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'La cantidad debe ser mayor a 0';
      }
      if (detail.currentStock !== undefined && detail.quantity > detail.currentStock) {
        newErrors[`quantity_${index}`] = `Stock insuficiente (disponible: ${detail.currentStock})`;
      }
      if (detail.discountAmount < 0) {
        newErrors[`discount_${index}`] = 'El descuento no puede ser negativo';
      }
      if (detail.discountAmount > (detail.quantity * detail.unitPrice)) {
        newErrors[`discount_${index}`] = 'El descuento no puede ser mayor al subtotal';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        {
          productId: 0,
          quantity: 1,
          unitPrice: 0,
          discountAmount: 0,
        },
      ],
    });
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: newDetails });
    
    const updatedSearchIndices = { ...productSearchIndices };
    delete updatedSearchIndices[index];
    const newSearchIndices: Record<number, string> = {};
    Object.keys(updatedSearchIndices).forEach(key => {
      const numKey = parseInt(key);
      const newKey = numKey > index ? numKey - 1 : numKey;
      newSearchIndices[newKey] = updatedSearchIndices[numKey];
    });
    setProductSearchIndices(newSearchIndices);
    
    const newErrors = { ...errors };
    delete newErrors[`product_${index}`];
    delete newErrors[`quantity_${index}`];
    delete newErrors[`unitPrice_${index}`];
    delete newErrors[`discount_${index}`];
    setErrors(newErrors);
  };

  const handleProductSelection = (index: number, productId: number) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const prices = getCurrentPrices(selectedProduct);
      const newDetails = [...formData.details];
      newDetails[index] = {
        ...newDetails[index],
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        currentStock: selectedProduct.currentStock,
        sellingPrice: prices.selling,
        unitPrice: prices.selling || 0,
      };
      setFormData({ ...formData, details: newDetails });
      
      const newSearchIndices = { ...productSearchIndices };
      newSearchIndices[index] = selectedProduct.name;
      setProductSearchIndices(newSearchIndices);
      
      const newErrors = { ...errors };
      delete newErrors[`product_${index}`];
      setErrors(newErrors);
    }
  };

  const handleDetailChange = (index: number, field: keyof SaleDetail, value: number) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };
    setFormData({ ...formData, details: newDetails });
    
    const newErrors = { ...errors };
    delete newErrors[`${field}_${index}`];
    if (errors[`${String(field)}_${index}`]) {
      delete newErrors[`${String(field)}_${index}`];
    }
    setErrors(newErrors);
  };

  const handleProductSearchChange = (index: number, value: string) => {
    setProductSearchIndices({
      ...productSearchIndices,
      [index]: value
    });
    
    if (!value) {
      const newDetails = [...formData.details];
      newDetails[index] = {
        ...newDetails[index],
        productId: 0,
        productName: undefined,
        currentStock: undefined,
        sellingPrice: undefined,
        unitPrice: 0,
      };
      setFormData({ ...formData, details: newDetails });
    }
  };

  const handleClientSelection = (clientId: number) => {
    setFormData({ ...formData, clientId: clientId.toString() });
    setClientSearchTerm('');
    const newErrors = { ...errors };
    delete newErrors.clientId;
    setErrors(newErrors);
  };

  const calculateTotal = () => {
    return formData.details.reduce((total, detail) => {
      if (detail.productId && detail.quantity && detail.unitPrice) {
        const subtotal = detail.quantity * detail.unitPrice;
        const discount = detail.discountAmount || 0;
        return total + (subtotal - discount);
      }
      return total;
    }, 0);
  };

  const calculateDetailSubtotal = (detail: SaleDetail) => {
    if (detail.productId && detail.quantity && detail.unitPrice !== undefined) {
      const subtotal = detail.quantity * detail.unitPrice;
      const discount = detail.discountAmount || 0;
      return Math.max(0, subtotal - discount);
    }
    return 0;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSaleCreated: () => void
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Por favor corrige los errores en el formulario');
      return false;
    }
  
    setIsSubmitting(true);
    try {
      const createDateWithCurrentTime = (dateString: string) => {
        const selectedDate = new Date(dateString + 'T00:00:00.000');
        const now = new Date();
        
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
        selectedDate.setSeconds(now.getSeconds());
        selectedDate.setMilliseconds(now.getMilliseconds());
        
        return selectedDate.toISOString();
      };
  
      const saleData = {
        clientId: parseInt(formData.clientId),
        saleDate: createDateWithCurrentTime(formData.saleDate),
        notes: formData.notes || undefined,
        details: formData.details.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          // ✅ REMOVER unitPrice - el backend lo calcula automáticamente
          discountAmount: detail.discountAmount || 0,
        })),
      };
  
      await saleService.createSale(saleData);
      showToast('success', 'Venta registrada exitosamente');
      onSaleCreated();
      resetForm();
      return true;
    } catch (error: any) {
      let displayMessage = 'Error al registrar la venta. Inténtalo de nuevo.';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          displayMessage = error.response.data.message.join('; ');
        } else if (typeof error.response.data.message === 'string') {
          displayMessage = error.response.data.message;
        }
      }
      showToast('error', displayMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.documentNumber.includes(clientSearchTerm)
  );

  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm) return products.slice(0, 10);
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const selectedClient = clients.find(c => c.id.toString() === formData.clientId);

  useEffect(() => {
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return {
    formData,
    setFormData,
    products,
    clients,
    setClients,
    errors,
    isSubmitting,
    isLoadingData,
    clientSearchTerm,
    setClientSearchTerm,
    productSearchIndices,
    selectedClient,
    filteredClients,
    getCurrentPrices,
    formatPrice,
    handleAddDetail,
    handleRemoveDetail,
    handleProductSelection,
    handleDetailChange,
    handleProductSearchChange,
    handleClientSelection,
    calculateTotal,
    calculateDetailSubtotal,
    handleSubmit,
    getFilteredProducts,
  };
};
