import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { OrderStatus } from '../types';
import { safeImage } from '../firebase';

const OrderTracker: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const steps: { label: string; status: OrderStatus }[] = [
    { label: 'Placed', status: 'Order Placed' },
    { label: 'Processing', status: 'Processing' },
    { label: 'Shipping', status: 'Shipping' },
    { label: 'Delivery', status: 'Delivery' },
    { label: 'Delivered', status: 'Delivered' },
  ];

  const currentStep = steps.findIndex(s => s.status === status);
  const isCancelled = status === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="py-8 px-6 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">🚫</div>
        <div className="text-left">
          <p className="text-lg font-black text-red-600 uppercase tracking-tight">Order Cancelled</p>
          <p className="text-xs font-bold text-red-400">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 rounded-full" />
        
        {/* Progress Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          className="absolute top-3 left-0 h-1 bg-primary rounded-full z-10"
        />

        <div className="relative flex justify-between z-20">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.label} className="flex flex-col items-center group">
                {/* Point */}
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      scale: isCurrent ? 1.2 : 1,
                      backgroundColor: isCompleted ? '#F97316' : '#E5E7EB',
                    }}
                    className={`w-7 h-7 rounded-full border-4 border-white shadow-sm transition-colors relative`}
                  >
                    {isCurrent && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-primary rounded-full -z-10"
                      />
                    )}
                  </motion.div>
                </div>

                {/* Label */}
                <div className="mt-4 text-center">
                  <p className={`text-[9px] md:text-xs font-black uppercase tracking-tighter md:tracking-widest transition-colors ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DeliveryCountdown: React.FC<{ createdAt: number; status: OrderStatus }> = ({ createdAt, status }) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);

  useEffect(() => {
    const targetTime = createdAt + (72 * 60 * 60 * 1000); // 72 hours
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;
      
      if (diff <= 0 || status === 'Delivered' || status === 'Cancelled') {
        setTimeLeft(0);
        return;
      }
      
      setTimeLeft(diff);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [createdAt, status]);

  if (status === 'Delivered' || status === 'Cancelled') return null;
  if (timeLeft <= 0) return null;

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-gray-100 text-center space-y-6 bg-gradient-to-br from-red-50/50 to-white rounded-[2rem] p-8 md:p-14 border border-red-100/50 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-200/30 transition-colors duration-700" />
      
      <div className="space-y-2">
        <p className="text-xl md:text-4xl font-black text-gray-900 uppercase tracking-tight flex items-center justify-center gap-3">
          <span className="animate-bounce">🚀</span> Fast Delivery Guaranteed
        </p>
        <p className="text-sm md:text-xl font-bold text-red-500/80">
          Your order will be delivered within 72 hours!
        </p>
      </div>

      <div className="flex justify-center gap-6 md:gap-12 pt-4 relative">
        <div className="flex flex-col items-center">
          <div className="bg-white w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] shadow-sm border border-red-100 flex items-center justify-center mb-2">
            <span className="text-3xl md:text-6xl font-black text-red-600 tabular-nums">{hours.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Hours</span>
        </div>
        
        <div className="text-3xl md:text-6xl font-black text-red-200 pt-4 md:pt-8">:</div>
        
        <div className="flex flex-col items-center">
          <div className="bg-white w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] shadow-sm border border-red-100 flex items-center justify-center mb-2">
            <span className="text-3xl md:text-6xl font-black text-red-600 tabular-nums">{minutes.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Minutes</span>
        </div>
        
        <div className="text-3xl md:text-6xl font-black text-red-200 pt-4 md:pt-8">:</div>
        
        <div className="flex flex-col items-center">
          <div className="bg-white w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] shadow-sm border border-red-100 flex items-center justify-center mb-2">
            <span className="text-3xl md:text-6xl font-black text-red-600 tabular-nums animate-pulse">{seconds.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export const OrdersScreen: React.FC = () => {
  const { orders, products, setScreen, refreshOrders, t } = useApp();
  const [activeTab, setActiveTab] = useState<{ [key: string]: 'track' | 'details' | null }>({});

  useEffect(() => {
    refreshOrders();
  }, []);

  const toggleTab = (orderId: string, tab: 'track' | 'details') => {
    setActiveTab(prev => ({
      ...prev,
      [orderId]: prev[orderId] === tab ? null : tab
    }));
  };

  const getPrice = (item: any) => {
    const itemPrice = Number(item.selectedVariant?.price || item.price || 0);
    if (itemPrice > 0) return itemPrice;
    
    // Fallback to current product price if order item price is 0 (for old orders)
    const product = products.find(p => p.id === item.id);
    return Number(product?.price || 0);
  };

  return (
    <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
      <Header title={t('myOrders')} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-40 bg-white rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <span className="text-7xl md:text-9xl mb-6">📦</span>
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{t('noOrders')}</h3>
            <p className="text-gray-500 mb-10 md:text-xl max-w-md text-center px-6">{t('noOrdersSubtitle')}</p>
            <button 
              onClick={() => setScreen('home')}
              className="bg-secondary text-white font-bold px-12 py-5 md:px-20 md:py-8 rounded-2xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] text-base md:text-2xl active:scale-95 transition-all hover:bg-primary"
            >
              {t('startShopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {orders.map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden group"
              >
                <div className="p-6 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full" />
                        <p className="text-xs md:text-base text-gray-400 font-black uppercase tracking-[0.2em]">{t('orderId')} <span className="text-gray-900">#{order.id.slice(-6)}</span></p>
                      </div>
                      <p className="text-sm md:text-2xl text-gray-500 font-bold pl-5">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                    </div>
                    
                    <div className={`px-6 py-3 md:px-10 md:py-4 rounded-2xl text-xs md:text-base font-black uppercase tracking-widest shadow-sm border transition-all duration-300 ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-gray-50 text-gray-900 border-gray-100'
                    }`}>
                      {order.status === 'Order Placed' ? t('orderPlaced') :
                       order.status === 'Processing' ? t('processingStatus') :
                       order.status === 'Shipping' ? t('shippingStatus') :
                       order.status === 'Delivery' ? t('deliveryStatus') :
                       order.status === 'Delivered' ? t('delivered') : 
                       order.status === 'Cancelled' ? t('cancelledStatus') : order.status}
                    </div>
                  </div>

                  {/* Product Preview */}
                  <div className="flex gap-4 items-center mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img 
                        src={Array.isArray(order.items[0]?.images) && order.items[0]?.images.length > 0 ? order.items[0]?.images[0] : (order.items[0]?.image || "https://via.placeholder.com/300")} 
                        alt={order.items[0]?.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-xl font-black text-gray-900 truncate tracking-tight">{order.items[0]?.name}</p>
                      <p className="text-xs md:text-base text-gray-500 font-bold">
                        {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : '1 item ordered'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg md:text-2xl font-black text-primary">₹{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      onClick={() => toggleTab(order.id, 'track')}
                      className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                        activeTab[order.id] === 'track' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-600 border-gray-100 hover:border-primary/20'
                      }`}
                    >
                      <span className="text-lg">📍</span> Track Order
                    </button>
                    <button 
                      onClick={() => toggleTab(order.id, 'details')}
                      className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                        activeTab[order.id] === 'details' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-600 border-gray-100 hover:border-primary/20'
                      }`}
                    >
                      <span className="text-lg">📄</span> View Details
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab[order.id] === 'track' && (
                      <motion.div 
                        key="track"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-8 border-t border-gray-100 relative">
                          <button 
                            onClick={() => toggleTab(order.id, 'track')}
                            className="absolute top-4 right-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-30"
                          >
                            ✕
                          </button>
                          <OrderTracker status={order.status} />
                          <DeliveryCountdown createdAt={order.createdAt} status={order.status} />
                        </div>
                      </motion.div>
                    )}

                    {activeTab[order.id] === 'details' && (
                      <motion.div 
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-8 border-t border-gray-100 space-y-8 relative">
                          <button 
                            onClick={() => toggleTab(order.id, 'details')}
                            className="absolute top-4 right-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-30"
                          >
                            ✕
                          </button>
                          {/* Tracking Info */}
                          {(order.trackingNumber || order.estimatedDelivery) && (
                            <div className="p-6 md:p-8 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100">
                              {order.trackingNumber && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tracking Number</span>
                                  <p className="font-black text-gray-900 text-sm md:text-lg tracking-tight">#{order.trackingNumber}</p>
                                </div>
                              )}
                              {order.estimatedDelivery && (
                                <div className="md:text-right space-y-1">
                                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Est. Delivery</span>
                                  <p className="font-black text-accent text-sm md:text-lg tracking-tight">
                                    {typeof order.estimatedDelivery === 'number' 
                                      ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                      : order.estimatedDelivery}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="space-y-6">
                            {order.items.map((item, idx) => (
                              <div key={item.cartItemId || idx} className="flex gap-4 items-center p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                  <img 
                                    src={Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "https://via.placeholder.com/300")} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm md:text-lg font-black text-gray-900 truncate tracking-tight">{item.name}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Qty: {item.quantity}</span>
                                    <span className="text-sm md:text-lg text-primary font-black">₹{getPrice(item).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-2">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Delivery Address</p>
                              <p className="text-xs md:text-sm text-gray-600 font-bold leading-relaxed max-w-xs">{order.address}</p>
                            </div>
                            
                            <div className="md:text-right space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order Total</p>
                              <p className="text-xl md:text-3xl font-black text-gray-900">₹{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="orders" onNavigate={setScreen} />
    </div>
  );
};
