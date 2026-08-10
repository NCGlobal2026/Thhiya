import React from 'react';

interface BrandMarkProps {
  variant?: 'navy' | 'white';
  className?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const weightClassMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export const BrandMark: React.FC<BrandMarkProps> = ({
  variant = 'navy',
  className = '',
  weight = 'bold',
}) => {
  const baseColor = variant === 'white' ? 'text-white' : 'text-navy-950';
  const weightClass = weightClassMap[weight];

  return (
    <span className={`${baseColor} ${weightClass} ${className}`}>
      Thhiya
      <span className="text-red-500">.</span>
    </span>
  );
};
