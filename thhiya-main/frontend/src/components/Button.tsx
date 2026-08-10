import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      secondary: 'border-2 border-navy-950 text-navy-950 bg-transparent hover:bg-navy-950 hover:text-white focus:ring-navy-950',
      ghost: 'text-navy-950 hover:bg-gray-100 focus:ring-gray-300',
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    // Remove the 'onDrag' prop from native button attributes because framer-motion
    // expects a different type signature for onDrag which conflicts with React's DragEvent
    const { onDrag, ...restProps } = props as any;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...restProps}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
