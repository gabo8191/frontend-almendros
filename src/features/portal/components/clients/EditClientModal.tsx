import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, FileText } from 'lucide-react';
import { Client } from '../../api/client/clientService';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Modal from '../../../../shared/components/Modal';
import { 
  ClientFormData, 
  validateClientForm, 
  formatPhoneNumber 
} from '../../schemas/client.schema';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (data: Partial<Client>) => Promise<void>;
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: client.name,
    email: client.email,
    phoneNumber: client.phoneNumber,
    address: client.address,
    documentType: client.documentType,
    documentNumber: client.documentNumber,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      ...formData,
      phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : formData.phoneNumber,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address?.trim(),
      documentNumber: formData.documentNumber.trim(),
    };

    setIsSubmitting(true);
    try {
      await onSave(finalData);
      onClose();
    } catch (error: any) {
      let errorMessage = 'Error al actualizar el cliente. Por favor, inténtalo de nuevo.';
      
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="lg">
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
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            icon={<Mail size={18} />}
            required
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
              Formato internacional requerido (ej: +573001234567)
            </p>
          </div>

          <Input
            label="Dirección"
            value={formData.address || ''}
            onChange={handleInputChange('address')}
            icon={<MapPin size={18} />}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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

export default EditClientModal;
