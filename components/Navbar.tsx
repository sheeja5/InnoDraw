import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface NavbarProps {
    onNavigate: (page: 'home' | 'create') => void;
    currentPage: 'home' | 'create';
}

const NavLink: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode }> = ({ onClick, isActive, children }) => {
    const activeClasses = "text-teal-500";
    const inactiveClasses = "text-slate-600 hover:text-teal-500";
    return (
        <button
            onClick={onClick}
            className={`transition-colors duration-200 font-medium pb-1 border-b-2 ${isActive ? `${activeClasses} border-teal-500` : `${inactiveClasses} border-transparent`}`}
        >
            {children}
        </button>
    );
};


const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <LogoIcon className="h-8 w-8 text-teal-500" />
            <span className="text-2xl font-bold text-slate-800">InnoDraw AI</span>
          </div>
          <div className="flex items-center space-x-8">
            <NavLink onClick={() => onNavigate('home')} isActive={currentPage === 'home'}>
              Home
            </NavLink>
            <NavLink onClick={() => onNavigate('create')} isActive={currentPage === 'create'}>
              Create
            </NavLink>
            <a href="#" className="hidden md:inline text-slate-600 hover:text-teal-500 transition-colors duration-200 font-medium">Learn</a>
            <a href="#" className="hidden md:inline text-slate-600 hover:text-teal-500 transition-colors duration-200 font-medium">Community</a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
