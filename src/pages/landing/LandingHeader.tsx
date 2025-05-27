import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../shared/components/Header';
import Button from '../../shared/components/Button';

interface LandingHeaderProps {
  modals: {
    mobileMenu: boolean;
    about: boolean;
    support: boolean;
    privacy: boolean;
    terms: boolean;
  };
  onToggleModal: (modalName: keyof LandingHeaderProps['modals']) => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ modals, onToggleModal }) => {
  const navLinks = (
    <>
      <button 
        onClick={() => onToggleModal('about')} 
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        Acerca de
      </button>
      <button 
        onClick={() => onToggleModal('support')}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        Contacto
      </button>
      <Link 
        to="/login" 
        className="text-primary-600 hover:text-primary-700 transition-colors"
        onClick={() => onToggleModal('mobileMenu')}
      >
        Iniciar Sesión
      </Link>
    </>
  );

  return (
    <Header 
      showNavigation={true}
      navLinks={navLinks}
      isMobileMenuOpen={modals.mobileMenu}
      onToggleMobileMenu={() => onToggleModal('mobileMenu')}
    />
  );
};

export default LandingHeader;
