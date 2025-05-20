import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { productService, Product } from '../../api/productService';
import { clientService, Client } from '../../api/clientService';
import { useToast } from '../../../../shared/context/ToastContext';
import NewClientModal from '../../components/clients/NewClient';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: {
    saleDate: string;
    notes?: string;
    clientId: number;
    details: {
      quantity: number;
      unitPrice: number;
      discountAmount: number;
      productId: number;
    }[];
  }) => Promise<void>;
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
  onSave,
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
  const [productSearchTerm, setProductSearchTerm] = useState('');
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
          showToast('error', 'Error al cargar los datos');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
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
      if (!detail.productId) {
        newErrors[`product_${index}`] = 'Selecciona un producto';
      }
      
      if (detail.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'La cantidad debe ser mayor a 0';
      }
      
      if (detail.currentStock !== undefined && detail.quantity > detail.currentStock) {
        newErrors[`quantity_${index}`] = `Stock insuficiente (disponible: ${detail.currentStock})`;
      }
      
      if (detail.unitPrice <= 0) {
        newErrors[`unitPrice_${index}`] = 'El precio debe ser mayor a 0';
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
    // Update form data
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
    
    // Also update product search terms
    const updatedSearchIndices = { ...productSearchIndices };
    delete updatedSearchIndices[index];
    
    // Remap keys to ensure they match new indices
    const newSearchIndices: Record<number, string> = {};
    Object.keys(updatedSearchIndices).forEach(key => {
      const numKey = parseInt(key);
      const newKey = numKey > index ? numKey - 1 : numKey;
      newSearchIndices[newKey] = updatedSearchIndices[numKey];
    });
    
    setProductSearchIndices(newSearchIndices);
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
        unitPrice: selectedProduct.sellingPrice,
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
  };

  const handleProductSearchChange = (index: number, value: string) => {
    setProductSearchIndices({
      ...productSearchIndices,
      [index]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert to the format expected by the API
      const apiFormattedDetails = formData.details.map(detail => ({
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        discountAmount: detail.discountAmount,
        productId: detail.productId,
      }));
      
      await onSave({
        saleDate: new Date(formData.saleDate).toISOString(),
        notes: formData.notes || undefined,
        clientId: parseInt(formData.clientId),
        details: apiFormattedDetails,
      });
      onClose();
      setFormData({
        clientId: '',
        saleDate: new Date().toISOString().split('T')[0],
        notes: '',
        details: [],
      });
      setProductSearchIndices({});
    } catch (error) {
      showToast('error', 'Error al registrar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.documentNumber.includes(clientSearchTerm)
  );

  const getFilteredProducts = (searchTerm: string) => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const calculateTotal = () => {
    return formData.details.reduce((total, detail) => {
      return total + (detail.quantity * detail.unitPrice - detail.discountAmount);
    }, 0);
  };

  const calculateDetailSubtotal = (detail: SaleDetail) => {
    if (detail.productId && detail.quantity && detail.unitPrice !== undefined) {
      const discount = detail.discountAmount || 0;
      return ((detail.quantity * detail.unitPrice) - discount).toFixed(2);
    }
    return "0.00";
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nueva Venta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar cliente..."
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
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-2 cursor-pointer hover:bg-gray-50 ${
                    formData.clientId === client.id.toString() ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, clientId: client.id.toString() })}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500">
                    {client.documentType}: {client.documentNumber}
                  </div>
                </div>
              ))}
            </div>
            {errors.clientId && (
              <p className="text-sm text-red-600">{errors.clientId}</p>
            )}
          </div>

          <Input
            type="date"
            label="Fecha de Venta"
            value={formData.saleDate}
            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Productos
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
              <p className="mt-1 text-sm text-red-600">{errors.details}</p>
            )}

            <div className="space-y-4">
              {formData.details.map((detail, index) => {
                const searchTerm = productSearchIndices[index] || '';
                const filteredProductsList = getFilteredProducts(searchTerm);
                
                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Buscar producto..."
                          value={searchTerm}
                          onChange={(e) => handleProductSearchChange(index, e.target.value)}
                          icon={<Search size={18} />}
                          className="flex-1"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto border rounded-lg mb-2">
                        {filteredProductsList.map((product) => (
                          <div
                            key={product.id}
                            className={`p-2 cursor-pointer hover:bg-gray-50 ${
                              detail.productId === product.id ? 'bg-primary-50' : ''
                            } ${product.currentStock < 1 ? 'opacity-50' : ''}`}
                            onClick={() => handleProductSelection(index, product.id)}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm font-medium">
                                ${product.sellingPrice?.toFixed(2) || "0.00"}
                              </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Stock: {product.currentStock}</span>
                              {product.currentStock < 5 && (
                                <span className="text-amber-600 flex items-center">
                                  <AlertCircle size={14} className="mr-1" /> Bajo stock
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors[`product_${index}`] && (
                        <p className="text-sm text-red-600">{errors[`product_${index}`]}</p>
                      )}
                    </div>

                    {detail.productId > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          type="number"
                          label="Cantidad"
                          min="1"
                          value={detail.quantity}
                          onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value))}
                          error={errors[`quantity_${index}`]}
                        />
                        <Input
                          type="number"
                          label="Precio Unitario"
                          step="0.01"
                          min="0"
                          value={detail.unitPrice}
                          onChange={(e) => handleDetailChange(index, 'unitPrice', parseFloat(e.target.value))}
                          error={errors[`unitPrice_${index}`]}
                        />
                        <Input
                          type="number"
                          label="Descuento"
                          step="0.01"
                          min="0"
                          value={detail.discountAmount}
                          onChange={(e) => handleDetailChange(index, 'discountAmount', parseFloat(e.target.value))}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm font-medium">
                        {detail.productId > 0 ? (
                          <span>Subtotal: ${calculateDetailSubtotal(detail)}</span>
                        ) : <span className="text-gray-400">Selecciona un producto</span>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleRemoveDetail(index)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Input
            label="Notas (opcional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Registrar Venta
            </Button>
          </div>
        </form>
      </Modal>

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