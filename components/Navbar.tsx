
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-teal-500" />
            <span className="text-2xl font-bold text-slate-800">InnoDraw AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Learn', 'Create', 'Community'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-slate-600 hover:text-teal-500 transition-colors duration-200 font-medium"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
