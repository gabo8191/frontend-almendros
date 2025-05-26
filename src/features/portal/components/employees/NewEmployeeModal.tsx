import React, { useState } from 'react';
import { X, Mail, User, Phone, MapPin, Lock } from 'lucide-react';
import { Role } from '../../../auth/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { 
  CreateEmployeeFormData,
  createEmployeeSchema,
  validatePassword,
  getPasswordRequirements,
  formatPhoneNumber
} from '../../schemas/employee.schema';
import { getRecommendedEmailDomains } from '../../../../shared/constants';
import { z } from 'zod';

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phoneNumber?: string;
    address?: string;
  }) => Promise<void>;
}

const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CreateEmployeeFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: Role.SALESPERSON,
    phoneNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: Role.SALESPERSON,
      phoneNumber: '',
      address: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    try {
      // Formatear el teléfono antes de validar
      const dataToValidate = {
        ...formData,
        phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : formData.phoneNumber,
      };
      
      createEmployeeSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
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

  const handleInputChange = (field: keyof CreateEmployeeFormData) => (
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
    
    console.log('Form data before validation:', formData); // Debug
    
    if (!validateForm()) {
      console.log('Validation failed with errors:', errors); // Debug
      return;
    }

    setIsSubmitting(true);
    
    const { confirmPassword, ...submitData } = formData;
    
    const cleanData: any = {
      email: submitData.email.trim().toLowerCase(),
      password: submitData.password,
      firstName: submitData.firstName.trim(),
      lastName: submitData.lastName.trim(),
      role: submitData.role,
    };

    // Solo agregar campos opcionales si tienen valor
    if (submitData.phoneNumber && submitData.phoneNumber.trim() !== '') {
      cleanData.phoneNumber = formatPhoneNumber(submitData.phoneNumber.trim());
    }

    if (submitData.address && submitData.address.trim() !== '') {
      cleanData.address = submitData.address.trim();
    }

    console.log('Sending data to server:', cleanData); // Debug

    try {
      await onSave(cleanData);
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      
      let errorMessage = 'Error al crear el empleado. Por favor, inténtalo de nuevo.';
      
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

  const passwordRequirements = getPasswordRequirements();
  const passwordErrors = validatePassword(formData.password);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-apple-md w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Empleado</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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

          <div className="mb-4">
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={errors.password}
              icon={<Lock size={18} />}
              required
              placeholder="Contraseña segura"
            />
            
            {(passwordFocused || formData.password.length > 0) && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Requisitos de contraseña:
                </p>
                <div className="space-y-1">
                  {passwordRequirements.map((requirement, index) => {
                    const isValid = !passwordErrors.includes(requirement);
                    
                    return (
                      <div key={index} className="flex items-center text-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
                          {requirement}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            icon={<Lock size={18} />}
            required
            placeholder="Confirmar contraseña"
          />

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              value={formData.role}
              onChange={handleInputChange('role')}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={Role.SALESPERSON}>Vendedor</option>
              <option value={Role.ADMINISTRATOR}>Administrador</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Crear Empleado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEmployeeModal;
