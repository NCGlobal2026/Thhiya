import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

export interface MegaMenuItem {
  name: string;
  to: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavMegaMenuProps {
  isOpen: boolean;
  items: MegaMenuItem[];
  onClose: () => void;
}

export const NavMegaMenu: React.FC<NavMegaMenuProps> = ({ isOpen, items, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-6"
          onMouseEnter={(e) => e.stopPropagation()} 
        >
            {/* Invisible bridge to prevent closing when moving from link to menu */}
            <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"/>

          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="group flex items-start gap-4 p-4 rounded-xl hover:bg-navy-50 transition-colors"
                onClick={onClose}
              >
                <div className="p-2 bg-navy-100/50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-navy-600 group-hover:text-navy-700">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-navy-900 group-hover:text-red-600 transition-colors">
                      {item.name}
                    </span>
                     {item.badge && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded leading-tight">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-6 -mb-6 px-6 py-4">
            <div className='flex flex-col'>
                <span className="text-sm font-medium text-navy-900">Need help deciding?</span>
                <span className="text-xs text-gray-500">Check our comprehensive guides.</span>
            </div>
            <Link to="/contact" className="text-sm font-semibold text-red-600 hover:text-red-700">
                Contact Support &rarr;
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
