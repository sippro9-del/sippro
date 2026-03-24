import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { Coupon } from '../types';
import { safeImage } from '../firebase';

export const CartScreen: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, setScreen, t, applyCoupon, discount, appliedCoupon, couponError } = useApp();
  const [couponCode, setCouponCode] = useState('');

  const subtotal = (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCoupon(couponCode);
  };

  return (
    <div className="pb-64 md:pb-32 bg-main-gradient min-h-screen">
      <Header title={t('myCart')} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-32 bg-white rounded-3xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-100">
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl md:text-8xl mb-4"
            >
              🛒
            </motion.span>
            <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{t('cartEmpty')}</h3>
            <p className="text-gray-500 md:text-lg mb-8 text-center max-w-md px-6">{t('startShopping')}</p>
            <button 
              onClick={() => setScreen('home')}
              className="bg-secondary text-white font-bold px-10 py-4 md:px-16 md:py-6 rounded-xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] hover:bg-primary transition-all"
            >
              {t('startShopping')}
            </button>
          </div>
        ) : (
          <div className="lg:flex lg:gap-12 lg:items-start">
            <div className="lg:flex-1 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div 
                    key={item.cartItemId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 flex gap-4 md:gap-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:shadow-md transition-all"
                  >
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img 
                        src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "https://via.placeholder.com/300")} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: "1",
                          visibility: "visible"
                        }}
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-1">{item.name}</h5>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {item.selectedVariant && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary/5 text-[10px] text-primary font-bold rounded-full border border-primary/10">
                            {item.selectedVariant.name}
                          </span>
                        )}
                        <p className="text-primary font-bold text-lg md:text-2xl mt-1 md:mt-3">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-gray-50 rounded-xl px-2 py-1 md:px-4 md:py-2 gap-3 md:gap-6 border border-gray-100">
                          <button 
                            onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center font-bold text-gray-400 hover:text-primary md:text-xl transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm md:text-lg font-bold text-gray-900 min-w-[15px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center font-bold text-gray-400 hover:text-primary md:text-xl transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{t('subtotal')}</p>
                          <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Coupon Section (Mobile/Tablet) */}
              <div className="lg:hidden bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] mt-6">
                <h5 className="font-bold text-gray-900 text-xs mb-3">{t('couponCode')}</h5>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-xs font-bold focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-secondary text-white px-6 py-3 rounded-xl text-[10px] font-bold active:scale-95 transition-all shadow-[0_4px_10px_rgba(249,115,22,0.3)]"
                  >
                    {t('apply')}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[9px] font-bold mt-2 ml-1">❌ {couponError}</p>}
                {appliedCoupon && <p className="text-green-500 text-[9px] font-bold mt-2 ml-1">✅ {t('couponApplied')}</p>}
              </div>
            </div>

            {/* Order Summary (Desktop) */}
            <div className="hidden lg:block w-96 bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sticky top-32">
              <h4 className="text-xl font-bold text-gray-900 mb-6">{t('orderSummary')}</h4>
              
              {/* Coupon Section (Desktop) */}
              <div className="mb-8">
                <h5 className="font-bold text-gray-900 text-xs mb-3">{t('couponCode')}</h5>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-xs font-bold focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-secondary text-white px-6 py-3 rounded-xl text-[10px] font-bold active:scale-95 transition-all shadow-[0_4px_10px_rgba(249,115,22,0.3)]"
                  >
                    {t('apply')}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[9px] font-bold mt-2 ml-1">❌ {couponError}</p>}
                {appliedCoupon && <p className="text-green-500 text-[9px] font-bold mt-2 ml-1">✅ {t('couponApplied')}</p>}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-base">{t('subtotal')}</span>
                  <span className="font-bold text-gray-900 text-base">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-base">{t('discount')}</span>
                    <span className="font-bold text-base">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <span className="text-gray-900 font-bold text-xl">{t('totalAmount')}</span>
                  <span className="text-3xl font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={() => setScreen('checkout')}
                className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] hover:bg-primary-dark transition-all text-lg"
              >
                {t('checkout')}
              </button>
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">{t('subtotal')}</span>
                <span className="text-xs font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-xs">{t('discount')}</span>
                  <span className="text-xs font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <span className="text-gray-900 font-bold text-lg">{t('totalAmount')}</span>
                <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={() => setScreen('checkout')}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all text-lg"
            >
              {t('checkout')}
            </button>
          </div>
        </div>
      )}

      <BottomNav active="cart" onNavigate={setScreen} />
    </div>
  );
};
