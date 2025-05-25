import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { productService, Product } from '../../api/productService';
import { clientService, Client } from '../../api/clientService';
import { saleService } from '../../api/saleService';
import { useToast } from '../../../../shared/context/ToastContext';
import NewClientModal from '../../components/clients/NewClient';
import { useProductPrice } from '../pos/Hooks/useProductPrice';

// Component to display product price in search results
const ProductSearchPriceDisplay: React.FC<{ productId: number }> = ({ productId }) => {
  const { sellingPrice, loading, error } = useProductPrice(productId);
  
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  if (loading) return <span className="text-sm text-gray-500">Cargando...</span>;
  if (error) return <span className="text-sm text-red-500">Error</span>;
  
  return <span>{formatPrice(sellingPrice)}</span>;
};

// Price component for products in the sale
const ProductPriceDisplay: React.FC<{ productId: number; onPriceLoad: (price: number) => void }> = ({ productId, onPriceLoad }) => {
  const { sellingPrice, loading, error } = useProductPrice(productId);
  
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  // Call onPriceLoad when price is loaded
  useEffect(() => {
    if (sellingPrice !== null && !loading && !error) {
      onPriceLoad(sellingPrice);
    }
  }, [sellingPrice, loading, error, onPriceLoad]);

  if (loading) return <span className="text-sm text-gray-500">Cargando precio...</span>;
  if (error) return <span className="text-sm text-red-500">Error al cargar precio</span>;
  
  return (
    <span className="text-sm font-medium">
      Precio: {formatPrice(sellingPrice)}
    </span>
  );
};

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: () => void; // Changed to match SalesPage expectation
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
          console.error('Error loading data:', error);
          showToast('error', 'Error al cargar los datos');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [isOpen, showToast]);

  // Reset form when modal closes
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
      
      if (!detail.unitPrice || detail.unitPrice <= 0) {
        newErrors[`unitPrice_${index}`] = 'El precio debe ser mayor a 0';
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
    setFormData({
      ...formData,
      details: newDetails,
    });
    
    // Clean up product search terms
    const updatedSearchIndices = { ...productSearchIndices };
    delete updatedSearchIndices[index];
    
    // Remap keys to match new indices
    const newSearchIndices: Record<number, string> = {};
    Object.keys(updatedSearchIndices).forEach(key => {
      const numKey = parseInt(key);
      const newKey = numKey > index ? numKey - 1 : numKey;
      newSearchIndices[newKey] = updatedSearchIndices[numKey];
    });
    
    setProductSearchIndices(newSearchIndices);

    // Clear related errors
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
      const newDetails = [...formData.details];
      newDetails[index] = {
        ...newDetails[index],
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        currentStock: selectedProduct.currentStock,
        sellingPrice: selectedProduct.sellingPrice,
        unitPrice: 0, // Will be set when price loads
      };
      setFormData({ ...formData, details: newDetails });

      // Clear product search for this index
      const newSearchIndices = { ...productSearchIndices };
      newSearchIndices[index] = selectedProduct.name;
      setProductSearchIndices(newSearchIndices);

      // Clear related errors
      const newErrors = { ...errors };
      delete newErrors[`product_${index}`];
      setErrors(newErrors);
    }
  };

  // Handle price loading from the ProductPriceDisplay component
  const handlePriceLoad = (index: number, price: number) => {
    const newDetails = [...formData.details];
    if (newDetails[index] && newDetails[index].unitPrice === 0) {
      newDetails[index] = {
        ...newDetails[index],
        unitPrice: price,
      };
      setFormData({ ...formData, details: newDetails });
    }
  };

  const handleDetailChange = (index: number, field: keyof SaleDetail, value: number) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };
    setFormData({ ...formData, details: newDetails });

    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`${field}_${index}`];
    setErrors(newErrors);
  };

  const handleProductSearchChange = (index: number, value: string) => {
    setProductSearchIndices({
      ...productSearchIndices,
      [index]: value
    });

    // If the search is cleared, reset the product selection
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
      // Format the sale date properly
      const saleDateTime = new Date(formData.saleDate + 'T12:00:00Z').toISOString();
      
      // Convert to the format expected by the API
      const saleData = {
        saleDate: saleDateTime,
        notes: formData.notes.trim() || undefined,
        clientId: parseInt(formData.clientId),
        details: formData.details.map(detail => ({
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          discountAmount: detail.discountAmount || 0,
          productId: detail.productId,
        })),
      };

      console.log('Sending sale data:', saleData);
      
      await saleService.createSale(saleData);
      
      showToast('success', 'Venta registrada exitosamente');
      onSaleCreated();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating sale:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Datos inválidos';
        showToast('error', `Error: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        showToast('error', 'Cliente o producto no encontrado');
      } else {
        showToast('error', 'Error al registrar la venta. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSelection = (clientId: number) => {
    setFormData({ ...formData, clientId: clientId.toString() });
    setClientSearchTerm('');
    
    // Clear client error
    const newErrors = { ...errors };
    delete newErrors.clientId;
    setErrors(newErrors);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.documentNumber.includes(clientSearchTerm)
  );

  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm) return products.slice(0, 10); // Show first 10 if no search
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

          {/* Sale Date */}
          <Input
            type="date"
            label="Fecha de Venta *"
            value={formData.saleDate}
            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
          />

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

                    {/* Product Selection */}
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
                              <ProductPriceDisplay 
                                productId={selectedProduct.id}
                                onPriceLoad={(price) => handlePriceLoad(index, price)}
                              />
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
                                filteredProductsList.map((product) => (
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
                                          Precio: <ProductSearchPriceDisplay productId={product.id} />
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
                                ))
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

                    {/* Product Details */}
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
                            onChange={(e) => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            error={errors[`unitPrice_${index}`]}
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
                            ${calculateDetailSubtotal(detail).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agregar notas sobre la venta..."
            />
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary-600">
                ${calculateTotal().toFixed(2)}
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
              disabled={formData.details.length === 0 || !formData.clientId}
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
              console.error('Error creating client:', error);
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