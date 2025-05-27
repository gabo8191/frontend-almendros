import React from 'react';
import { LeafyGreen } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  showNavigation?: boolean;
  navLinks?: React.ReactNode;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  showNavigation = false, 
  navLinks,
  isMobileMenuOpen = false,
  onToggleMobileMenu 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
      <Link to="/" className="flex items-center">
        <LeafyGreen className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">Almendros</span>
      </Link>
      
      {showNavigation && (
        <>
          <nav className="hidden lg:block">
            <ul className="flex space-x-8">
              {navLinks}
            </ul>
          </nav>

          {onToggleMobileMenu && (
            <MobileMenu isOpen={isMobileMenuOpen} onToggle={onToggleMobileMenu}>
              <div className="flex flex-col space-y-4">
                {navLinks}
              </div>
            </MobileMenu>
          )}
        </>
      )}
    </header>
  );
};

export default Header;
