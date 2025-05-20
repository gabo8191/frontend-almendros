import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Supplier } from '../../api/supplierService';

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: {
    name: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    address: string;
    documentType: 'CC' | 'TI';
    documentNumber: string;
  }) => Promise<boolean>;
}

const NewSupplierModal: React.FC<NewSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    address: '',
    documentType: 'CC' as Supplier['documentType'],
    documentNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const name = formData.name.trim();
    const contactName = formData.contactName.trim();
    const email = formData.email.trim();
    const documentNumber = formData.documentNumber.trim();
    const phoneNumber = formData.phoneNumber.trim();

    if (!name) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (!contactName) {
      newErrors.contactName = 'El nombre de contacto es requerido';
    } else if (contactName.length < 2) {
      newErrors.contactName = 'El nombre de contacto debe tener al menos 2 caracteres';
    } else if (contactName.length > 100) {
      newErrors.contactName = 'El nombre de contacto no puede exceder 100 caracteres';
    }

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!documentNumber) {
      newErrors.documentNumber = 'El número de documento es requerido';
    } else if (formData.documentType === 'CC') {
      if (!/^\d{6,10}$/.test(documentNumber)) {
        newErrors.documentNumber = 'Formato de CC inválido';
      }
    } else if (formData.documentType === 'TI') {
      if (!/^\d{10,11}$/.test(documentNumber)) {
        newErrors.documentNumber = 'Formato de TI inválido';
      }
    }

    if (phoneNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,7}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Formato de teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    if (!validateForm()) {
      return;
    }

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
      documentNumber: formData.documentNumber.trim(),
    };

    console.log('Submitting supplier data:', cleanedData);

    setIsSubmitting(true);
    try {
      const success = await onSave(cleanedData);
      if (success) {
        onClose();
        setFormData({
          name: '',
          contactName: '',
          email: '',
          phoneNumber: '',
          address: '',
          documentType: 'CC',
          documentNumber: '',
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      
      if (error.response && error.response.data) {
        console.log('Error response data:', error.response.data);
        
        if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            setServerError(error.response.data.message.join('. '));
          } else {
            setServerError(error.response.data.message);
          }
        } else if (error.response.data.error) {
          setServerError(`${error.response.data.error}: ${error.response.data.statusCode}`);
        } else {
          setServerError('Error al crear el proveedor. Por favor intente de nuevo.');
        }
      } else {
        setServerError('Error de conexión. Por favor verifique su conexión a internet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Proveedor"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {serverError}
          </div>
        )}
        
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
          error={errors.contactName}
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
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
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
          error={errors.phoneNumber}
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
            Crear Proveedor
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewSupplierModal;