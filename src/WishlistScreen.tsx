import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { Header, BottomNav } from './components/Common';
import { ProductCard } from './components/HomeScreen';

export const WishlistScreen: React.FC = () => {
  const { products, profile, setScreen, setSelectedProduct, addToCart, t } = useApp();

  const wishlistProducts = products.filter(p => profile?.wishlist?.includes(p.id));

  return (
    <div className="pb-32 bg-main-gradient min-h-screen">
      <Header title={t('myWishlist')} />
      
      <div className="w-full px-2 md:px-4 py-8 md:py-12">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-32 md:py-48 bg-white rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-100">
            <span className="text-7xl md:text-9xl block mb-6 md:mb-10">💝</span>
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900">{t('wishlistEmpty')}</h3>
            <p className="text-gray-500 mt-4 text-base md:text-xl max-w-md mx-auto px-6">
              Save items you love to find them easily later and keep track of price drops.
            </p>
            <button 
              onClick={() => setScreen('home')}
              className="mt-10 md:mt-14 bg-secondary text-white px-12 py-5 md:px-20 md:py-8 rounded-2xl text-lg md:text-2xl font-bold shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all hover:bg-primary"
            >
              {t('startShopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-[10px] md:gap-[14px]">
            {wishlistProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={() => {
                  setSelectedProduct(product);
                  setScreen('product-details');
                }}
                onAdd={() => addToCart(product)}
                fullWidth
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="wishlist" onNavigate={setScreen} />
    </div>
  );
};
