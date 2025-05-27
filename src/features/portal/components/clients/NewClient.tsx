import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, FileText } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { 
  ClientFormData, 
  validateClientForm, 
  formatPhoneNumber 
} from '../../schemas/client.schema';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    documentType: string;
    documentNumber: string;
  }) => Promise<boolean>;
}

const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    documentType: 'CC',
    documentNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      documentType: 'CC',
      documentNumber: '',
    });
    setErrors({});
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phoneNumber: value });
    
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

  const handleInputChange = (field: keyof ClientFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateClientForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const finalData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : '',
      address: formData.address?.trim() || '',
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim(),
    };

    setIsSubmitting(true);
    try {
      const success = await onSave(finalData);
      if (success) {
        onClose();
        resetForm();
      }
    } catch (error: any) {
      let errorMessage = 'Error al crear el cliente. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Cliente" size="lg">
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            icon={<User size={18} />}
            required
            placeholder="Ingresa el nombre completo"
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            icon={<Mail size={18} />}
            required
            placeholder="ejemplo@correo.com"
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
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="NIT">NIT</option>
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
              placeholder="12345678"
            />
          </div>

          <div>
            <Input
              label="Teléfono"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              error={errors.phoneNumber}
              icon={<Phone size={18} />}
              placeholder="+573001234567"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formato internacional requerido (ej: +573001234567). Campo opcional.
            </p>
          </div>

          <Input
            label="Dirección"
            value={formData.address || ''}
            onChange={handleInputChange('address')}
            icon={<MapPin size={18} />}
            placeholder="Calle 123 #45-67, Ciudad"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Crear Cliente
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewClientModal;
