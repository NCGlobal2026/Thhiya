import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  const cardClasses = `bg-white rounded-card shadow-card p-6 ${hover ? 'transition-all duration-200 hover:shadow-card-hover' : ''} ${className}`;
  
  if (hover) {
    return (
      <motion.div
        className={cardClasses}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }
  
  return <div className={cardClasses}>{children}</div>;
};
