import React from 'react';
import { Phone, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { Modal } from './Modal';
import Button from './Button';
import { useToast } from '../context/ToastContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  const phoneNumbers = [
    {
      label: 'Soporte Principal',
      number: '+57 3125509123',
      cleanNumber: '573125509123',
      primary: true
    },
    {
      label: 'Soporte Alternativo', 
      number: '+57 3188708253',
      cleanNumber: '573188708253',
      primary: false
    }
  ];

  const copyToClipboard = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      showToast('success', 'Número copiado al portapapeles');
    } catch (error) {
      showToast('error', 'Error al copiar el número');
    }
  };

  const openWhatsApp = (cleanNumber: string) => {
    const message = encodeURIComponent('Hola, necesito soporte técnico con el sistema de almendros.');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const makeCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contactar Soporte" size="md">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone size={32} className="text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-600">
            Nuestro equipo de soporte está disponible para ayudarte
          </p>
        </div>

        <div className="space-y-4">
          {phoneNumbers.map((phone, index) => (
            <div 
              key={index}
              className={`border rounded-xl p-4 ${
                phone.primary 
                  ? 'border-primary-200 bg-primary-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      phone.primary ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {phone.label}
                    </h4>
                    {phone.primary && (
                      <span className="px-2 py-1 text-xs bg-primary-200 text-primary-800 rounded-full">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className={`text-lg font-mono ${
                    phone.primary ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {phone.number}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={phone.primary ? undefined : 'outline'}
                  icon={<Phone size={16} />}
                  onClick={() => makeCall(phone.number)}
                  className="flex-1 sm:flex-none"
                >
                  Llamar
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  icon={<MessageCircle size={16} />}
                  onClick={() => openWhatsApp(phone.cleanNumber)}
                  className="flex-1 sm:flex-none"
                >
                  WhatsApp
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Copy size={16} />}
                  onClick={() => copyToClipboard(phone.number)}
                  className="flex-1 sm:flex-none"
                >
                  Copiar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <ExternalLink size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Horarios de Atención
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Lunes a Viernes: 8:00 AM - 6:00 PM</li>
                <li>• Sábados: 9:00 AM - 2:00 PM</li>
                <li>• Emergencias: 24/7 por WhatsApp</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupportModal;
