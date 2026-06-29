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
  rightElement?: React.ReactNode;
}> = ({ title, showBack, onBack, showSearch, searchQuery, onSearchChange, rightElement }) => {
  const { t, currentScreen, setScreen, cart } = useApp();
  const cartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-50 bg-warm-gradient shadow-lg px-4 py-3 md:py-4 border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 flex-1">
            {showBack && (
              <button onClick={onBack} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {title ? (
              <h1 
                onClick={() => setScreen('home')}
                className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md flex-1 cursor-pointer hover:opacity-95"
              >
                {title}
              </h1>
            ) : (
              <div onClick={() => setScreen('home')} className="flex items-center gap-3 group cursor-pointer flex-1">
                <div className="bg-white p-2 rounded-xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all duration-300 border-2 border-primary/20">
                  <span className="text-primary font-black text-lg">S</span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md">Sip</span>
                  <span className="font-black text-2xl tracking-tighter text-white/90 italic ml-0.5 drop-shadow-md">Pro</span>
                </div>
              </div>
            )}
            {rightElement && (
              <div className="flex items-center md:hidden">
                {rightElement}
              </div>
            )}
          </div>
        </div>
        
        {showSearch && (
          <div className="relative w-full md:max-w-xs lg:max-w-md md:flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="text-xl opacity-60">🔍</span>
            </div>
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white/95 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-lg text-sm font-medium"
            />
          </div>
        )}

        {/* Desktop Top Navigation links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <button 
            onClick={() => setScreen('home')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all ${currentScreen === 'home' || currentScreen === 'all-products' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>🏠</span> {t('home')}
          </button>
          <button 
            onClick={() => setScreen('wishlist')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all ${currentScreen === 'wishlist' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>❤️</span> {t('wishlist')}
          </button>
          <button 
            onClick={() => setScreen('orders')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all ${currentScreen === 'orders' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>📦</span> {t('orders')}
          </button>
          <button 
            onClick={() => setScreen('chat')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all ${currentScreen === 'chat' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>✨</span> AI Info
          </button>
          <button 
            onClick={() => setScreen('cart')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all relative ${currentScreen === 'cart' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>🛒</span> {t('cart')}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setScreen('profile')} 
            className={`px-3 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all ${currentScreen === 'profile' || currentScreen === 'admin-dashboard' ? 'bg-white/15 text-white shadow-inner' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            <span>👤</span> {t('profile')}
          </button>
          {rightElement && (
            <div className="flex items-center ml-2">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC<{ active: string; onNavigate: (screen: any) => void }> = ({ active, onNavigate }) => {
  const { t } = useApp();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#3B2F2F] border-t border-white/5 z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.2)] md:hidden">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <NavItem active={active === 'home'} icon="🏠" label={t('home')} onClick={() => onNavigate('home')} />
        <NavItem active={active === 'wishlist'} icon="❤️" label={t('wishlist')} onClick={() => onNavigate('wishlist')} />
        <NavItem active={active === 'orders'} icon="📦" label={t('orders')} onClick={() => onNavigate('orders')} />
        <NavItem active={active === 'chat'} icon="✨" label="AI Info" onClick={() => onNavigate('chat')} />
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
