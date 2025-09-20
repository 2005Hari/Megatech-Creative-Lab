import React from 'react';
import type { User } from '../types';
import { BrainCircuitIcon, LayoutGridIcon, SparklesIcon, LogOutIcon } from './Icons';

interface HeaderProps {
    onNavigate: (view: 'generator' | 'library') => void;
    currentView: 'generator' | 'library';
    user: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, user, onLogout }) => {
  const navButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2";
  const activeClasses = "bg-gold/10 text-gold font-semibold";
  const inactiveClasses = "text-warm-gray hover:bg-cream";
  
  return (
    <header className="bg-beige/80 backdrop-blur-sm border-b border-dusty-rose sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="h-8 w-8 text-maroon" />
          <h1 className="text-xl md:text-2xl font-bold text-charcoal tracking-tight">
            Megatech's <span className="text-maroon">Creative Lab</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2 p-1 bg-beige rounded-lg border border-dusty-rose">
              <button onClick={() => onNavigate('generator')} className={`${navButtonClasses} ${currentView === 'generator' ? activeClasses : inactiveClasses}`}>
                  <SparklesIcon className="h-4 w-4" />
                  Dashboard
              </button>
              <button onClick={() => onNavigate('library')} className={`${navButtonClasses} ${currentView === 'library' ? activeClasses : inactiveClasses}`}>
                  <LayoutGridIcon className="h-4 w-4" />
                  Library
              </button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-warm-gray hidden sm:block">{user.email}</span>
            <button onClick={onLogout} className="p-2 rounded-md text-warm-gray hover:bg-dusty-rose/50 hover:text-maroon transition-colors" aria-label="Logout">
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};