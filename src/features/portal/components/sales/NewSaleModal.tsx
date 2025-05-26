import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { productService } from '../../api/productService';
import { clientService, Client } from '../../api/clientService';
import { saleService } from '../../api/saleService';
import { useToast } from '../../../../shared/context/ToastContext';
import NewClientModal from '../../components/clients/NewClient';

interface Product {
  id: number;
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  supplierId: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prices?: Array<{
    id: number;
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
  }>;
  purchasePrice?: number;
  sellingPrice?: number;
}

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: () => void;
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

const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
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
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchIndices, setProductSearchIndices] = useState<Record<number, string>>({});
  const { showToast } = useToast();

  const getCurrentPrices = (product: Product) => {
    if (product.prices && Array.isArray(product.prices) && product.prices.length > 0) {
      const currentPrice = product.prices.find(p => p.isCurrentPrice) || product.prices[0];
      return {
        selling: currentPrice.sellingPrice,
        purchase: currentPrice.purchasePrice
      };
    }
    return {
      selling: product.sellingPrice,
      purchase: product.purchasePrice
    };
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
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
      }
    };
    fetchData();
  }, [isOpen, showToast]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        clientId: '',
        saleDate: new Date().toISOString().split('T')[0],
        notes: '',
        details: [],
      });
      setProductSearchIndices({});
      setErrors({});
      setClientSearchTerm('');
    }
  }, [isOpen]);

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
      // Note: Removed unitPrice validation since it's now readonly
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
    setFormData({
      ...formData,
      details: newDetails,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const saleDate = formData.saleDate;

      const saleData = {
        clientId: parseInt(formData.clientId),
        saleDate: saleDate,
        notes: formData.notes || undefined,
        details: formData.details.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          discountAmount: detail.discountAmount || 0,
        })),
      };

      console.log('🚀 Datos que se enviarán al servidor:', saleData);

      await saleService.createSale(saleData);
      showToast('success', 'Venta registrada exitosamente');
      onSaleCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let displayMessage = 'Error al registrar la venta. Inténtalo de nuevo.';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          displayMessage = error.response.data.message.join('; ');
        } else if (typeof error.response.data.message === 'string') {
          displayMessage = error.response.data.message;
        }
      }
      showToast('error', displayMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSelection = (clientId: number) => {
    setFormData({ ...formData, clientId: clientId.toString() });
    setClientSearchTerm('');
    const newErrors = { ...errors };
    delete newErrors.clientId;
    setErrors(newErrors);
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

  const selectedClient = clients.find(c => c.id.toString() === formData.clientId);

  if (isLoadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nueva Venta">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nueva Venta"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cliente *
            </label>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border">
                <div>
                  <div className="font-medium text-primary-900">{selectedClient.name}</div>
                  <div className="text-sm text-primary-600">
                    {selectedClient.documentType}: {selectedClient.documentNumber}
                  </div>
                  {selectedClient.email && (
                    <div className="text-sm text-primary-600">{selectedClient.email}</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({ ...formData, clientId: '' });
                    setClientSearchTerm('');
                  }}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar cliente por nombre o documento..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    icon={<Search size={18} />}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewClientModalOpen(true)}
                  >
                    Nuevo Cliente
                  </Button>
                </div>
                {clientSearchTerm && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => handleClientSelection(client.id)}
                        >
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-500">
                            {client.documentType}: {client.documentNumber}
                          </div>
                          {client.email && (
                            <div className="text-sm text-gray-500">{client.email}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        No se encontraron clientes
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.clientId && (
              <p className="text-sm text-red-600">{errors.clientId}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Venta *
            </label>
            <Input
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
            {errors.saleDate && (
              <p className="text-sm text-red-600">{errors.saleDate}</p>
            )}
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas / Descripción (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agrega detalles adicionales sobre la venta..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Products Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Productos *
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<Plus size={16} />}
                onClick={handleAddDetail}
              >
                Agregar Producto
              </Button>
            </div>
            {errors.details && (
              <p className="mb-4 text-sm text-red-600">{errors.details}</p>
            )}
            <div className="space-y-4">
              {formData.details.map((detail, index) => {
                const searchTerm = productSearchIndices[index] || '';
                const filteredProductsList = getFilteredProducts(searchTerm);
                const selectedProduct = products.find(p => p.id === detail.productId);
                return (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Producto #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleRemoveDetail(index)}
                        className="text-red-600 hover:text-red-800"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar producto
                      </label>
                      {selectedProduct ? (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <div className="font-medium">{selectedProduct.name}</div>
                            <div className="text-sm text-gray-500">
                              Stock: {selectedProduct.currentStock} |
                              Precio: {formatPrice(getCurrentPrices(selectedProduct).selling)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
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
                              setProductSearchIndices({ ...productSearchIndices, [index]: '' });
                            }}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Input
                            placeholder="Escribe para buscar productos..."
                            value={searchTerm}
                            onChange={(e) => handleProductSearchChange(index, e.target.value)}
                            icon={<Search size={18} />}
                          />
                          {(searchTerm || filteredProductsList.length > 0) && (
                            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white">
                              {filteredProductsList.length > 0 ? (
                                filteredProductsList.map((product) => {
                                  const prices = getCurrentPrices(product);
                                  return (
                                    <div
                                      key={product.id}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                                        product.currentStock < 1 ? 'opacity-50' : ''
                                      }`}
                                      onClick={() => product.currentStock > 0 && handleProductSelection(index, product.id)}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-medium">{product.name}</div>
                                          <div className="text-sm text-gray-500">
                                            Stock: {product.currentStock} |
                                            Precio: {formatPrice(prices.selling)}
                                          </div>
                                        </div>
                                        {product.currentStock < 5 && product.currentStock > 0 && (
                                          <span className="text-amber-600 flex items-center text-xs">
                                            <AlertCircle size={12} className="mr-1" /> Bajo stock
                                          </span>
                                        )}
                                        {product.currentStock < 1 && (
                                          <span className="text-red-600 text-xs">Sin stock</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-3 text-center text-gray-500">
                                  No se encontraron productos
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {errors[`product_${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`product_${index}`]}</p>
                      )}
                    </div>
                    {detail.productId > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            type="number"
                            label="Cantidad *"
                            min="1"
                            max={detail.currentStock}
                            value={detail.quantity || ''}
                            onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            error={errors[`quantity_${index}`]}
                          />
                          <Input
                            type="number"
                            label="Precio Unitario *"
                            step="0.01"
                            min="0"
                            value={detail.unitPrice || ''}
                            readOnly={true}
                            error={errors[`unitPrice_${index}`]}
                            className="bg-gray-100"
                          />
                          <Input
                            type="number"
                            label="Descuento"
                            step="0.01"
                            min="0"
                            max={detail.quantity * detail.unitPrice}
                            value={detail.discountAmount || ''}
                            onChange={(e) => handleDetailChange(index, 'discountAmount', parseFloat(e.target.value) || 0)}
                            error={errors[`discount_${index}`]}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="font-semibold">
                            {formatPrice(calculateDetailSubtotal(detail))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary-600">
                {formatPrice(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={formData.details.length === 0 || !formData.clientId || !formData.saleDate}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <NewClientModal
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onSave={async (clientData) => {
            try {
              const newClient = await clientService.createClient(clientData);
              setClients([...clients, newClient]);
              setFormData({ ...formData, clientId: newClient.id.toString() });
              setIsNewClientModalOpen(false);
              showToast('success', 'Cliente creado exitosamente');
              return true;
            } catch (error) {
              showToast('error', 'Error al crear el cliente');
              return false;
            }
          }}
        />
      )}
    </>
  );
};

export default NewSaleModal;
