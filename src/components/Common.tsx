import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
    />
  </div>
);

export const Logo: React.FC<{ className?: string; light?: boolean }> = ({ className = "w-24 h-24", light = false }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative group">
      <div className={`w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-all duration-500 border-4 ${light ? 'bg-white border-white/20' : 'bg-gradient-to-br from-primary to-secondary border-white'}`}>
        <span className={`font-black text-4xl drop-shadow-md ${light ? 'text-primary' : 'text-white'}`}>S</span>
      </div>
      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform ${light ? 'bg-white border-gray-100' : 'bg-white border-gray-100'}`}>
        <span className="text-xl">🌿</span>
      </div>
    </div>
    <div className="mt-6 flex flex-col items-center">
      <div className="flex items-baseline gap-1">
        <span className={`font-black text-3xl tracking-tighter ${light ? 'text-white' : 'text-primary'}`}>Sip</span>
        <span className={`font-black text-3xl tracking-tighter italic ${light ? 'text-white/90' : 'text-secondary'}`}>Pro</span>
      </div>
      <div className={`h-1 w-12 rounded-full mt-1 ${light ? 'bg-white/40' : 'bg-gradient-to-r from-primary to-secondary'}`} />
      <span className={`font-black text-[10px] tracking-[0.3em] uppercase mt-2 opacity-80 ${light ? 'text-white/70' : 'text-gray-400'}`}>Premium Spices</span>
    </div>
  </div>
);

export const Header: React.FC<{ 
  title?: string; 
  showBack?: boolean; 
  onBack?: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}> = ({ title, showBack, onBack, showSearch, searchQuery, onSearchChange }) => {
  const { t } = useApp();
  return (
    <header className="sticky top-0 z-50 bg-warm-gradient shadow-lg px-4 py-3 md:py-5 border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4">
            {showBack && (
              <button onClick={onBack} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {title ? (
              <h1 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">{title}</h1>
            ) : (
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="bg-white p-2 rounded-xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all duration-300 border-2 border-primary/20">
                  <span className="text-primary font-black text-lg">S</span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md">Sip</span>
                  <span className="font-black text-2xl tracking-tighter text-white/90 italic ml-0.5 drop-shadow-md">Pro</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showSearch && (
          <div className="relative w-full md:max-w-xl md:flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="text-xl opacity-60">🔍</span>
            </div>
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white/95 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-lg text-sm md:text-base font-medium"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export const BottomNav: React.FC<{ active: string; onNavigate: (screen: any) => void }> = ({ active, onNavigate }) => {
  const { t } = useApp();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#3B2F2F] border-t border-white/5 z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.2)] md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[500px] md:rounded-3xl md:px-12">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center md:gap-16">
        <NavItem active={active === 'home'} icon="🏠" label={t('home')} onClick={() => onNavigate('home')} />
        <NavItem active={active === 'wishlist'} icon="❤️" label={t('wishlist')} onClick={() => onNavigate('wishlist')} />
        <NavItem active={active === 'orders'} icon="📦" label={t('orders')} onClick={() => onNavigate('orders')} />
        <NavItem active={active === 'cart'} icon="🛒" label={t('cart')} onClick={() => onNavigate('cart')} />
        <NavItem active={active === 'profile'} icon="👤" label={t('profile')} onClick={() => onNavigate('profile')} />
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group relative">
    {active && (
      <motion.div 
        layoutId="nav-active"
        className="absolute -top-1 w-1 h-1 bg-secondary rounded-full shadow-[0_0_10px_rgba(249,115,22,1)]"
      />
    )}
    <span className={`text-2xl transition-transform group-hover:scale-110 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-gray-400 opacity-60 grayscale'}`}>{icon}</span>
    <span className={`text-[10px] font-bold transition-colors ${active ? 'text-secondary' : 'text-gray-400 group-hover:text-secondary'}`}>{label}</span>
  </button>
);
