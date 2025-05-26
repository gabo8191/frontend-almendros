import React, { useState } from 'react';
import { X, Mail, User, Phone, MapPin, Lock, Check, AlertCircle } from 'lucide-react';
import { Role } from '../../../auth/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { 
  createEmployeeSchema, 
  type CreateEmployeeFormData,
  getPasswordRequirements,
  validatePassword 
} from '../../schemas/employee.schema';

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

  const validateForm = () => {
    try {
      createEmployeeSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
      }
      
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Preparar datos para enviar al servidor
    const { confirmPassword, ...submitData } = formData;
    
    const cleanData: any = {
      email: submitData.email,
      password: submitData.password,
      firstName: submitData.firstName,
      lastName: submitData.lastName,
      role: submitData.role,
    };

    // Solo agregar campos opcionales si tienen valor
    if (submitData.phoneNumber && submitData.phoneNumber.trim() !== '') {
      cleanData.phoneNumber = submitData.phoneNumber.trim();
    }

    if (submitData.address && submitData.address.trim() !== '') {
      cleanData.address = submitData.address.trim();
    }

    try {
      await onSave(cleanData);
      onClose();
      // Resetear el formulario
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
    } catch (error: any) {
      console.error('Error creating employee:', error);
      
      // Mostrar errores específicos del servidor si están disponibles
      if (error.response?.data?.details) {
        const serverErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: string) => {
          if (detail.toLowerCase().includes('password')) {
            serverErrors.password = detail;
          }
          if (detail.toLowerCase().includes('email')) {
            serverErrors.email = detail;
          }
        });
        setErrors(serverErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener errores específicos de contraseña para mostrar los requisitos
  const passwordErrors = validatePassword(formData.password);
  const passwordRequirements = getPasswordRequirements();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-apple-md w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Empleado</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
              icon={<User size={18} />}
              required
            />
            <Input
              label="Apellido"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
              icon={<User size={18} />}
              required
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            icon={<Mail size={18} />}
            required
          />

          <div className="mb-4">
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={errors.password}
              icon={<Lock size={18} />}
              required
            />
            
            {/* Requisitos de contraseña */}
            {(passwordFocused || formData.password.length > 0) && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Requisitos de contraseña:
                </p>
                <div className="space-y-1">
                  {passwordRequirements.map((requirement, index) => {
                    const isValid = !passwordErrors.some(error => 
                      requirement.toLowerCase().includes(error.toLowerCase()) ||
                      error.toLowerCase().includes(requirement.toLowerCase())
                    );
                    
                    return (
                      <div key={index} className="flex items-center text-sm">
                        {isValid ? (
                          <Check size={14} className="text-green-500 mr-2" />
                        ) : (
                          <AlertCircle size={14} className="text-gray-400 mr-2" />
                        )}
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
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            icon={<Lock size={18} />}
            required
          />

          <Input
            label="Teléfono (opcional)"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            icon={<Phone size={18} />}
          />

          <Input
            label="Dirección (opcional)"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            icon={<MapPin size={18} />}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={Role.SALESPERSON}>Vendedor</option>
              <option value={Role.ADMINISTRATOR}>Administrador</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
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