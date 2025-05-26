import React, { useState } from 'react';
import { X, Mail, User, Phone, MapPin } from 'lucide-react';
import { User as UserType } from '../../../auth/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { 
  UpdateEmployeeFormData, 
  validateEditEmployeeForm, 
  formatPhoneNumber,
  getRecommendedEmailDomains
} from '../../schemas/employee.schema';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: UserType;
  onSave: (data: Partial<UserType>) => Promise<void>;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateEmployeeFormData>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber || '',
    address: employee.address || '',
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

  const handleInputChange = (field: keyof UpdateEmployeeFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
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
    const validation = validateEditEmployeeForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Preparar datos finales con formateo
    const finalData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : '',
      address: formData.address?.trim() || '',
    };

    console.log('Updating employee with data:', finalData);

    setIsSubmitting(true);
    try {
      await onSave(finalData);
      onClose();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      
      let errorMessage = 'Error al actualizar el empleado. Por favor, inténtalo de nuevo.';
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-apple-md w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Empleado</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Show general error if exists */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={errors.firstName}
              icon={<User size={18} />}
              required
              placeholder="Nombre del empleado"
            />
            <Input
              label="Apellido"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={errors.lastName}
              icon={<User size={18} />}
              required
              placeholder="Apellido del empleado"
            />
          </div>

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

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
