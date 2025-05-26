import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, FileText, Building } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Supplier } from '../../api/supplierService';
import { 
  SupplierFormData, 
  validateSupplierForm, 
  formatPhoneNumber 
} from '../../schemas/supplier.schema';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  onSave: (supplierData: Partial<Pick<Supplier, 'name' | 'contactName' | 'email' | 'phoneNumber' | 'address' | 'documentType' | 'documentNumber'>>) => Promise<boolean>;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phoneNumber: value });
    
    // Limpiar error de teléfono si existe
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: '' });
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phoneNumber && !formData.phoneNumber.startsWith('+')) {
      const formatted = formatPhoneNumber(formData.phoneNumber);
      setFormData({ ...formData, phoneNumber: formatted });
    }
  };

  const handleInputChange = (field: keyof SupplierFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar con Zod
    const validation = validateSupplierForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Preparar datos finales con formateo
    const finalData = {
      name: formData.name.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formatPhoneNumber(formData.phoneNumber),
      address: formData.address.trim(),
      documentType: formData.documentType as Supplier['documentType'],
      documentNumber: formData.documentNumber.trim(),
    };

    console.log('Updating supplier with data:', finalData);

    setIsSubmitting(true);
    try {
      const success = await onSave(finalData);
      if (success) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      
      let errorMessage = 'Error al actualizar el proveedor. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ 
        submit: errorMessage
      });
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
        {/* Show general error if exists */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <Input
          label="Nombre de la Empresa"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={errors.name}
          icon={<Building size={18} />}
          required
          placeholder="Nombre de la empresa"
        />

        <Input
          label="Nombre del Contacto"
          value={formData.contactName}
          onChange={handleInputChange('contactName')}
          error={errors.contactName}
          icon={<User size={18} />}
          required
          placeholder="Nombre del contacto principal"
        />

        <Input
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          icon={<Mail size={18} />}
          required
          placeholder="correo@empresa.com"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              value={formData.documentType}
              onChange={handleInputChange('documentType')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="NIT">NIT</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
            {errors.documentType && (
              <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
            )}
          </div>

          <Input
            label="Número de Documento"
            value={formData.documentNumber}
            onChange={handleInputChange('documentNumber')}
            error={errors.documentNumber}
            icon={<FileText size={18} />}
            required
            placeholder="123456789"
          />
        </div>

        <div>
          <Input
            label="Teléfono"
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            error={errors.phoneNumber}
            icon={<Phone size={18} />}
            required
            placeholder="+573001234567"
          />
          <p className="mt-1 text-xs text-gray-500">
            Formato internacional requerido (ej: +573001234567)
          </p>
        </div>

        <Input
          label="Dirección"
          value={formData.address}
          onChange={handleInputChange('address')}
          error={errors.address}
          icon={<MapPin size={18} />}
          required
          placeholder="Calle 123 #45-67, Ciudad"
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
