import React from 'react';
import { LeafyGreen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-6 md:px-10 flex items-center justify-start bg-white shadow-sm">
      <Link to="/" className="flex items-center">
        <LeafyGreen className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-medium text-gray-900">Almendros</span>
      </Link>
    </header>
  );
};

export default Header;