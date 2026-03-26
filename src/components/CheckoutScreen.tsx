import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../AppContext';
import { Header } from './Common';
import { calculateDistance } from '../utils';
import { DELIVERY_CENTER, MAX_DELIVERY_RADIUS_KM, ALLOWED_PINCODES } from '../constants';

export const CheckoutScreen: React.FC = () => {
  const { cart, profile, placeOrder, updateProfile, setScreen, applyCoupon, discount, appliedCoupon, couponError, t } = useApp();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(!profile?.address || !profile?.city || !profile?.pincode);
  const [deliveryError, setDeliveryError] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');

  const subtotal = (cart || []).reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCoupon(couponCode);
  };

  const total = subtotal - discount;

  const getLatLngFromPincode = async (pincode: string) => {
    // Try Zippopotam first (better CORS support for India)
    try {
      const zipRes = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      if (zipRes.ok) {
        const zipData = await zipRes.json();
        if (zipData.places && zipData.places.length > 0) {
          return {
            lat: parseFloat(zipData.places[0].latitude),
            lng: parseFloat(zipData.places[0].longitude),
          };
        }
      }
    } catch (e) {
      console.warn("Zippopotam failed, trying Nominatim...", e);
    }

    // Fallback to Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`
      );
      if (!res.ok) throw new Error("Nominatim request failed");
      const data = await res.json();

      if (data.length === 0) {
        throw new Error("Invalid Pincode");
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error("Geocoding error:", err);
      if (err instanceof Error && err.message === "Failed to fetch") {
        throw new Error("Network error: Please check your internet connection or disable ad-blockers.");
      }
      throw err;
    }
  };

  const validateDelivery = async (pincode: string) => {
    if (!pincode) {
      setDeliveryError('Pincode is required');
      return false;
    }

    setDeliveryError('');
    
    // 🔥 FIRST CHECK (Special allow list)
    if (ALLOWED_PINCODES.includes(pincode)) {
      console.log("Delivery allowed via special pincode list");
      return true;
    }

    try {
      const userLoc = await getLatLngFromPincode(pincode);
      const distance = calculateDistance(
        userLoc.lat,
        userLoc.lng,
        DELIVERY_CENTER.lat,
        DELIVERY_CENTER.lng
      );

      console.log("Distance:", distance);

      if (distance > MAX_DELIVERY_RADIUS_KM) {
        setDeliveryError(`Delivery not available in your location (Distance: ${distance.toFixed(1)} km). We only deliver within ${MAX_DELIVERY_RADIUS_KM} km of ${DELIVERY_CENTER.name}.`);
        return false;
      } else {
        // Success!
        return true;
      }
    } catch (err) {
      console.error(err);
      setDeliveryError('Invalid Pincode or location not found');
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    setDeliveryError('');
    
    // Validate address before placing order
    const hasAddress = profile?.address && profile?.city && profile?.state && profile?.pincode;
    
    if (showForm && !isFormValid) return;
    if (!showForm && !hasAddress) {
      setShowForm(true);
      return;
    }

    setLoading(true);
    
    // Check delivery by pincode
    const pincodeToCheck = showForm ? formData.pincode : profile?.pincode;
    const isLocationValid = await validateDelivery(pincodeToCheck || '');
    
    if (!isLocationValid) {
      setLoading(false);
      return;
    }

    const finalAddress = showForm 
      ? `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode} (Phone: ${formData.phone})`
      : `${profile?.address}, ${profile?.city}, ${profile?.state} - ${profile?.pincode} (Phone: ${profile?.phone})`;

    try {
      // If form was shown or details were missing, save the address to profile
      if (showForm || !hasAddress) {
        await updateProfile({
          name: formData.name || profile?.name,
          phone: formData.phone || profile?.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        });
      }
      
      await placeOrder(finalAddress, paymentMethod, appliedCoupon);
      setScreen('orders');
      toast.success(t('order_placed_success') || 'Order placed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(t('order_failed'));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.phone && formData.address && formData.city && formData.state && formData.pincode;

  return (
    <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
      <Header showBack onBack={() => setScreen('cart')} title={t('checkout')} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 lg:flex lg:gap-16 lg:items-start">
        <div className="lg:flex-1 space-y-6 md:space-y-10">
          {/* Shipping Address */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900 text-lg md:text-xl">{t('shippingAddress')}</h4>
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="text-primary text-xs md:text-sm font-bold hover:underline"
                >
                  {t('change')}
                </button>
              )}
            </div>

            {showForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('fullName')}</label>
                    <input
                      type="text"
                      placeholder={t('fullName')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('phoneNumber')}</label>
                    <input
                      type="tel"
                      placeholder={t('phoneNumber')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('fullAddress')}</label>
                  <textarea
                    placeholder={t('fullAddress')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all h-24 resize-none shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('city')}</label>
                    <input
                      type="text"
                      placeholder={t('city')}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('state')}</label>
                    <input
                      type="text"
                      placeholder={t('state')}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1">{t('pincode')}</label>
                    <input
                      type="text"
                      placeholder={t('pincode')}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <p className="font-bold text-gray-900 text-lg">{profile?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{profile?.phone}</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile?.address}</p>
                <p className="text-sm text-gray-600 font-medium">{profile?.city}, {profile?.state} - {profile?.pincode}</p>
              </div>
            )}
          </div>

          {deliveryError && (
            <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex items-center gap-3">
              <span className="text-xl">📍</span>
              <p className="text-xs md:text-sm font-bold text-accent leading-relaxed">{deliveryError}</p>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <h4 className="font-bold text-gray-900 mb-6 text-lg md:text-xl">{t('paymentMethod')}</h4>
            <div className="space-y-3">
              <PaymentOption 
                active={paymentMethod === 'card'} 
                label={t('card')} 
                icon="💳" 
                onClick={() => setPaymentMethod('card')} 
              />
              <PaymentOption 
                active={paymentMethod === 'upi'} 
                label={t('upi')} 
                icon="📱" 
                onClick={() => setPaymentMethod('upi')} 
              />
              <PaymentOption 
                active={paymentMethod === 'cod'} 
                label={t('cod')} 
                icon="💵" 
                onClick={() => setPaymentMethod('cod')} 
              />
            </div>
          </div>
        </div>

        <div className="lg:w-[400px] space-y-6 md:space-y-10">
          {/* Order Summary */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sticky top-24">
            <h4 className="font-bold text-gray-900 mb-6 text-lg md:text-xl">{t('orderSummary')}</h4>
            
            {/* Coupon Code (Desktop) */}
            <div className="mb-8">
              <h5 className="font-bold text-gray-900 text-[10px] md:text-xs uppercase tracking-widest mb-3">{t('couponCode')}</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('enterCoupon')}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-100 focus:ring-1 focus:ring-primary outline-none transition-all text-sm shadow-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-6 py-3 bg-secondary text-white rounded-xl font-bold active:scale-95 transition-all text-xs shadow-[0_4px_10px_rgba(249,115,22,0.3)]"
                >
                  {t('apply')}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
              {appliedCoupon && (
                <div className="mt-3 flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100 shadow-sm">
                  <span className="text-green-700 text-xs font-bold">
                    {t('couponApplied')}: {appliedCoupon.code}
                  </span>
                  <button 
                    onClick={() => applyCoupon('')}
                    className="text-green-700 hover:text-green-900 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 text-sm md:text-lg">
                <span>{t('subtotal')}</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm md:text-lg">
                  <span>{t('discount')} ({appliedCoupon?.code})</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 text-sm md:text-lg">
                <span>{t('shipping')}</span>
                <span className="text-accent font-bold uppercase tracking-widest text-[10px] md:text-xs">{t('free')}</span>
              </div>
              <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg md:text-xl">{t('total')}</span>
                <span className="text-2xl md:text-4xl font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading || (showForm && !isFormValid)}
              className="w-full bg-primary text-white font-bold py-4 md:py-6 rounded-2xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50 text-base md:text-xl"
            >
              {loading ? t('processing') : `${t('placeOrder')} • ₹${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 md:p-8 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || (showForm && !isFormValid)}
            className="w-full bg-primary text-white font-bold py-4 md:py-6 rounded-xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? t('processing') : `${t('placeOrder')} • ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentOption: React.FC<{ active: boolean; label: string; icon: string; onClick: () => void }> = ({ active, label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 transition-all ${active ? 'bg-primary/5 border-primary shadow-sm' : 'bg-gray-50 border-gray-100'} hover:border-primary/50`}
  >
    <div className="flex items-center gap-3 md:gap-4">
      <span className="text-xl md:text-2xl">{icon}</span>
      <span className={`font-bold md:text-base ${active ? 'text-primary' : 'text-gray-600'}`}>{label}</span>
    </div>
    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-primary' : 'border-gray-300'}`}>
      {active && <div className="w-2.5 h-2.5 md:w-3 bg-primary rounded-full" />}
    </div>
  </button>
);
