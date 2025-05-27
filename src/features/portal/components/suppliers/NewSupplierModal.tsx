import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, FileText, Building } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { Supplier } from '../../api/supplier/supplierService';
import { 
  SupplierFormData, 
  validateSupplierForm, 
  formatPhoneNumber,
  getRecommendedEmailDomains
} from '../../schemas/supplier.schema';

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: {
    name: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    address: string;
    documentType: 'CC' | 'TI' | 'NIT' | 'CE' | 'PP';
    documentNumber: string;
  }) => Promise<boolean>;
}

const NewSupplierModal: React.FC<NewSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    address: '',
    documentType: 'NIT',
    documentNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phoneNumber: '',
      address: '',
      documentType: 'NIT',
      documentNumber: '',
    });
    setErrors({});
  };

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
      documentType: formData.documentType as any,
      documentNumber: formData.documentNumber.trim(),
    };

    console.log('Creating new supplier with data:', finalData);

    setIsSubmitting(true);
    try {
      const success = await onSave(finalData);
      if (success) {
        onClose();
        resetForm();
      }
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      
      let errorMessage = 'Error al crear el proveedor. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('. ');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      setErrors({ 
        submit: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Proveedor"
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

        <div>
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
          {errors.email && errors.email.includes('temporales') && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium mb-2">
                Sugerencias de correos válidos:
              </p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedEmailDomains().slice(0, 6).map((domain) => (
                  <span 
                    key={domain}
                    className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      const emailPart = formData.email.split('@')[0];
                      if (emailPart) {
                        setFormData({ ...formData, email: `${emailPart}@${domain}` });
                      }
                    }}
                  >
                    @{domain}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

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
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
