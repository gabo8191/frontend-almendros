import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  onClick?: () => void;
  isLoading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-300 to-blue-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    hover: 'hover:from-blue-400 hover:to-blue-500',
  },
  green: {
    bg: 'from-green-300 to-green-400',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    hover: 'hover:from-green-400 hover:to-green-500',
  },
  purple: {
    bg: 'from-purple-300 to-purple-400',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    hover: 'hover:from-purple-400 hover:to-purple-500',
  },
  orange: {
    bg: 'from-orange-300 to-orange-400',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    hover: 'hover:from-orange-400 hover:to-orange-500',
  },
  red: {
    bg: 'from-red-300 to-red-400',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    hover: 'hover:from-red-400 hover:to-red-500',
  },
  pink: {
    bg: 'from-pink-300 to-pink-400',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    hover: 'hover:from-pink-400 hover:to-pink-500',
  },
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  onClick,
  isLoading = false,
}) => {
  const colorClass = colorClasses[color];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br text-white rounded-2xl p-6 shadow-lg transform transition-all duration-300',
        colorClass.bg,
        onClick && cn('cursor-pointer hover:scale-105', colorClass.hover),
        'hover:shadow-xl'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl', colorClass.iconBg)}>
          <Icon size={24} className={colorClass.iconColor} />
        </div>
        {onClick && (
          <div className="text-white/80 text-xs font-medium bg-white/30 px-2 py-1 rounded-full">
            Ver más
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-white/90 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-white/80 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
