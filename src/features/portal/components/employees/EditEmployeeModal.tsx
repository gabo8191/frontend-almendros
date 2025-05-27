import React from 'react';
import { Mail, User, Phone, MapPin } from 'lucide-react';
import { User as UserType } from '../../../auth/types';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Modal from '../../../../shared/components/Modal';
import { getRecommendedEmailDomains } from '../../schemas/employee.schema';
import { useEditEmployeeForm } from './hooks/useEditEmployeeForm';

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
  const {
    formData,
    errors,
    isSubmitting,
    handlePhoneChange,
    handlePhoneBlur,
    handleInputChange,
    handleSubmit,
  } = useEditEmployeeForm(employee);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, onSave);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Empleado" size="lg">
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

export default EditEmployeeModal;
