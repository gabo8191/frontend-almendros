import React from 'react';
import { LeafyGreen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  to = "/", 
  size = 'md',
  className = "" 
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7', 
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const LogoContent = (
    <div className={`flex items-center ${className}`}>
      <LeafyGreen className={`${sizes[size]} text-primary-600`} />
      <span className={`ml-2 ${textSizes[size]} font-semibold text-gray-900`}>
        Almendros
      </span>
    </div>
  );

  if (to) {
    return <Link to={to}>{LogoContent}</Link>;
  }

  return LogoContent;
};

export default Logo;
