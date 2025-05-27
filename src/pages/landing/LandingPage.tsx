import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Modal from '../../shared/components/Modal';
import SupportModal from '../../shared/components/SupportModal';
import LandingHeader from './LandingHeader';
import { LeafyGreen } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [modals, setModals] = useState({
    mobileMenu: false,
    about: false,
    support: false,
    privacy: false,
    terms: false,
  });

  const toggleModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({
      ...prev,
      mobileMenu: modalName === 'mobileMenu' ? !prev.mobileMenu : false,
      [modalName]: !prev[modalName]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <LandingHeader 
        modals={modals}
        onToggleModal={toggleModal}
      />

      <main className="flex-grow flex items-center justify-center px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 tracking-tight">
            Bienvenido a Almendros
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Tu portal empresarial para la gestión integral de tarjetas y papelería.
          </p>
          <div className="mt-10">
            <Link to="/login">
              <Button
                size="lg"
                className="min-w-[160px] transform transition hover:scale-105"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 md:px-10 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <LeafyGreen className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">Almendros</span>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Almendros. Todos los derechos reservados.
          </div>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <button 
                  onClick={() => toggleModal('terms')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Términos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => toggleModal('privacy')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacidad
                </button>
              </li>
              <li>
                <button 
                  onClick={() => toggleModal('support')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ayuda
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <AboutModal 
        isOpen={modals.about} 
        onClose={() => toggleModal('about')} 
      />
      
      <SupportModal
        isOpen={modals.support}
        onClose={() => toggleModal('support')}
      />

      <PrivacyModal 
        isOpen={modals.privacy} 
        onClose={() => toggleModal('privacy')} 
      />

      <TermsModal 
        isOpen={modals.terms} 
        onClose={() => toggleModal('terms')} 
      />
    </div>
  );
};

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Acerca de Almendros">
    <div className="prose prose-sm">
      <p className="text-gray-600 mb-4">
        Este software está siendo desarrollado por un grupo de desarrolladores en la Universidad Pedagógica y Tecnológica de Colombia (UPTC).
      </p>
      <div className="space-y-2">
        <p className="text-gray-800">Gabriel Castillo</p>
        <p className="text-gray-800">Sebastian Cañon</p>
        <p className="text-gray-800">Oscar Gonzalez</p>
        <p className="text-gray-800">Jhon Castro</p>
        <p className="text-gray-800">Sebastian Zárate</p>
      </div>
    </div>
  </Modal>
);

const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Política de Privacidad">
    <div className="prose prose-sm">
      <p className="text-gray-600">
        En Almendros, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
      </p>
      <h4 className="text-gray-800 mt-4">Recopilación de Información</h4>
      <p className="text-gray-600">
        Recopilamos información necesaria para proporcionar nuestros servicios, incluyendo datos de contacto y detalles de uso del sistema.
      </p>
      <h4 className="text-gray-800 mt-4">Uso de la Información</h4>
      <p className="text-gray-600">
        Utilizamos tu información para mejorar nuestros servicios, proporcionar soporte y mantener la seguridad de la plataforma.
      </p>
    </div>
  </Modal>
);

const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Términos de Servicio">
    <div className="prose prose-sm">
      <p className="text-gray-600">
        Al utilizar Almendros, aceptas cumplir con nuestros términos de servicio. Estos términos establecen las reglas y regulaciones para el uso de nuestra plataforma.
      </p>
      <h4 className="text-gray-800 mt-4">Uso Aceptable</h4>
      <p className="text-gray-600">
        Te comprometes a utilizar nuestros servicios de manera ética y legal, respetando los derechos de otros usuarios y las políticas de la plataforma.
      </p>
      <h4 className="text-gray-800 mt-4">Licencia</h4>
      <p className="text-gray-600">
        Almendros y su contenido están protegidos por derechos de autor y otras leyes de propiedad intelectual.
      </p>
    </div>
  </Modal>
);

export default LandingPage;
