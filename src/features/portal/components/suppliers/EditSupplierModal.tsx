import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Supplier } from '../../api/supplierService';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  onSave: (supplierData: Partial<Supplier>) => Promise<boolean>; // Changed from Promise<void> to Promise<boolean>
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: supplier.name,
    contactName: supplier.contactName,
    email: supplier.email,
    phoneNumber: supplier.phoneNumber,
    address: supplier.address,
    documentType: supplier.documentType,
    documentNumber: supplier.documentNumber,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.documentNumber) {
      newErrors.documentNumber = 'El número de documento es requerido';
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
      const success = await onSave(formData); // Get the success boolean
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Proveedor"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la Empresa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Nombre del Contacto"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          required
        />

        <Input
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as Supplier['documentType'] })}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="NIT">NIT</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PP">Pasaporte</option>
            </select>
          </div>

          <Input
            label="Número de Documento"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            error={errors.documentNumber}
            required
          />
        </div>

        <Input
          label="Teléfono"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />

        <Input
          label="Dirección"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSupplierModal;