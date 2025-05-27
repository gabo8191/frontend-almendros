import React from 'react';
import { Mail, User, Phone, MapPin, Lock } from 'lucide-react';
import { Role } from '../../../auth/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Modal from '../../../../shared/components/Modal';
import { getRecommendedEmailDomains } from '../../../../shared/constants';
import { useNewEmployeeForm } from './hooks/useNewEmployeeForm';

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
  const {
    formData,
    errors,
    isSubmitting,
    passwordFocused,
    setPasswordFocused,
    passwordRequirements,
    passwordErrors,
    handlePhoneChange,
    handlePhoneBlur,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = useNewEmployeeForm();

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSave);
    if (success) {
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Empleado" size="lg">
      <form onSubmit={onSubmit}>
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="space-y-4">
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
                          handleInputChange('email')({ target: { value: `${emailPart}@${domain}` } } as any);
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

          <div>
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
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Crear Empleado
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewEmployeeModal;
