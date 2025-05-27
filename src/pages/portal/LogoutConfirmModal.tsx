import React from 'react';
import { LogOut } from 'lucide-react';
import Modal from '../../shared/components/Modal';
import Button from '../../shared/components/Button';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Cierre de Sesión"
      size="sm"
    >
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} className="text-red-600" />
          </div>
          <p className="text-gray-900 font-medium mb-2">
            {userName ? `¡Hasta luego, ${userName}!` : '¿Estás seguro?'}
          </p>
          <p className="text-gray-600">
            ¿Deseas cerrar sesión en Almendros?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tendrás que volver a iniciar sesión para acceder al portal.
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutConfirmModal;
