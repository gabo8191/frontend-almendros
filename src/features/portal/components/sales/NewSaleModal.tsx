import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Plus } from 'lucide-react';
import { clientService } from '../../api/client/clientService';
import { useToast } from '../../../../shared/context/ToastContext';
import ClientSelectionSection from './ClientSelectionSection';
import ProductDetailItem from './ProductDetailItem';
import { useNewSaleForm } from './hooks/useNewSaleForm';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: () => void;
}

const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
  const { showToast } = useToast();

  const {
    formData,
    setFormData,
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
    getCurrentPrices: hookGetCurrentPrices, // ✅ Renombrar
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
  } = useNewSaleForm(isOpen);

  // ✅ Función wrapper que garantiza types correctos
  const getCurrentPrices = (product: any) => {
    const prices = hookGetCurrentPrices(product);
    return {
      selling: prices.selling || 0,
      purchase: prices.purchase || 0,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSaleCreated);
    if (success) {
      onClose();
    }
  };

  const handleNewClientSave = async (clientData: any) => {
    try {
      const newClient = await clientService.createClient(clientData);
      setClients([...clients, newClient]);
      setFormData({ ...formData, clientId: newClient.id.toString() });
      showToast('success', 'Cliente creado exitosamente');
      return true;
    } catch (error) {
      showToast('error', 'Error al crear el cliente');
      return false;
    }
  };

  const handleClientClear = () => {
    setFormData({ ...formData, clientId: '' });
    setClientSearchTerm('');
  };

  const handleProductClear = (index: number) => {
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
    handleProductSearchChange(index, '');
  };

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
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Venta" size="lg">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Client Selection */}
        <ClientSelectionSection
          selectedClient={selectedClient}
          clientSearchTerm={clientSearchTerm}
          setClientSearchTerm={setClientSearchTerm}
          filteredClients={filteredClients}
          errors={errors}
          onClientSelection={handleClientSelection}
          onClientClear={handleClientClear}
          onNewClientSave={handleNewClientSave}
        />

        {/* Date Selection */}
        <Input
          type="date"
          label="Fecha de Venta *"
          value={formData.saleDate}
          onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          error={errors.saleDate}
          required
        />

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
            <label className="block text-sm font-medium text-gray-700">Productos *</label>
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
              const selectedProduct = getFilteredProducts('').find(p => p.id === detail.productId);
              
              return (
                <ProductDetailItem
                  key={index}
                  index={index}
                  detail={detail}
                  searchTerm={searchTerm}
                  selectedProduct={selectedProduct}
                  filteredProducts={filteredProductsList}
                  errors={errors}
                  onRemove={handleRemoveDetail}
                  onProductSelection={handleProductSelection}
                  onDetailChange={handleDetailChange}
                  onSearchChange={handleProductSearchChange}
                  onProductClear={handleProductClear}
                  formatPrice={formatPrice}
                  getCurrentPrices={getCurrentPrices} // ✅ Ahora usa la función wrapper
                  calculateDetailSubtotal={calculateDetailSubtotal}
                />
              );
            })}
          </div>
        </div>

        {/* Total */}
        {formData.details.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary-600">{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={formData.details.length === 0 || !formData.clientId || !formData.saleDate}
          >
            Registrar Venta
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewSaleModal;
