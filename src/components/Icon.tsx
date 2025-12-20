import React from 'react';
import { Icons, IconType } from './icons';
import { LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconType;
  className?: string;
}

/**
 * Универсальный компонент для отображения иконок
 *
 * @example
 * <Icon name="Gamepad" className="w-5 h-5 text-blue-500" />
 * <Icon name="Fire" className="w-6 h-6" />
 */
export const Icon: React.FC<IconProps> = ({ name, className = '', ...props }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} {...props} />;
};

export default Icon;
