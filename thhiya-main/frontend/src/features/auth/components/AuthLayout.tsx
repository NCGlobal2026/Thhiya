import React from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from '../../../components';

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  heroImage?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  maxWidth = "max-w-md",
  heroImage = "/images/signup_hero.png"
}) => (
  <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
    <div className="hidden lg:flex lg:w-[45%] flex-col overflow-hidden bg-navy-950 group fixed left-0 top-0 h-screen">
      <img src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute inset-0 bg-linear-to-b from-navy-950/60 via-transparent to-navy-950/40"></div>
      <div className="absolute bottom-0 left-0 w-full p-12 z-10">
        <div className="flex gap-2">
          <div className="h-1.5 w-16 bg-red-600 rounded-full"></div>
          <div className="h-1.5 w-6 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
    <div className="flex-1 flex flex-col bg-white min-h-screen overflow-y-auto lg:ml-[45%]">
      <div className="p-4 sm:p-8 lg:p-5 pb-0">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <Link to="/"><BrandMark variant="navy" className="text-2xl" /></Link>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className={`w-full ${maxWidth} z-10 animate-in fade-in slide-in-from-right-8 duration-700`}>
          {children}
        </div>
      </div>
    </div>
  </div>
);
